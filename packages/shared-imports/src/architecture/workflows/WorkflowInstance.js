/**
 * Workflow Instance
 *
 * Manages individual workflow execution with state management and error handling
 */

import { createLogger } from "@whatsfresh/shared-imports";
import { componentLifecycleManager } from "./ComponentLifecycleManager.js";
import { workflowMonitor } from "./monitoring/WorkflowMonitor.js";

const log = createLogger("WorkflowInstance");

export class WorkflowInstance {
  constructor(definition, context, options = {}) {
    this.definition = definition;
    this.context = context;
    this.options = {
      timeout: 30000, // 30 second default timeout
      retryAttempts: 3,
      enableProgressTracking: true,
      ...options,
    };

    this.state = {
      status: "initialized",
      data: {},
      errors: [],
      startTime: null,
      endTime: null,
      currentStep: null,
    };

    this.steps = [];
    this.executionId = this.generateExecutionId();
    this.progressTracker = null;
    this.managedComponents = new Set();
  }

  /**
   * Execute the workflow
   * @returns {Promise<Object>} Execution result
   */
  async execute() {
    this.state.startTime = new Date();
    this.state.status = "running";

    log.info("Starting workflow execution", {
      workflow: this.definition.name,
      executionId: this.executionId,
      context: this.sanitizeContext(this.context),
    });

    // Initialize progress tracking
    const { progressTracker } = await import("./ProgressTracker.js");
    progressTracker.startTracking(this.executionId, this.definition);

    // Start monitoring
    workflowMonitor.startExecution(
      this.executionId,
      this.definition,
      this.context
    );

    try {
      // Check for workflow dependencies
      if (this.definition.dependencies) {
        await this.resolveDependencies();
      }

      // Load persisted state if resuming
      if (this.options.resumable) {
        await this.loadPersistedState();
      }

      // Execute workflow steps with orchestration patterns
      await this.executeSteps();

      this.state.status = "completed";
      this.state.endTime = new Date();

      // Trigger context refresh if specified
      if (this.definition.contextRefresh) {
        await this.triggerContextRefresh();
      }

      const executionResult = {
        success: true,
        data: this.state.data,
        executionId: this.executionId,
        duration: this.state.endTime - this.state.startTime,
        stepsExecuted: this.steps.length,
      };

      // Complete progress tracking
      progressTracker.completeTracking(this.executionId, executionResult);

      // Complete monitoring
      workflowMonitor.completeExecution(this.executionId, executionResult);

      // Clean up persisted state if completed successfully
      if (this.options.resumable) {
        await this.cleanupPersistedState();
      }

      // Cleanup managed components
      await this.cleanupManagedComponents();

      log.info("Workflow execution completed successfully", {
        workflow: this.definition.name,
        executionId: this.executionId,
        duration: executionResult.duration,
      });

      return executionResult;
    } catch (error) {
      this.state.status = "failed";
      this.state.endTime = new Date();
      this.state.errors.push({
        message: error.message,
        stack: error.stack,
        step: this.state.currentStep,
        timestamp: new Date().toISOString(),
      });

      log.error("Workflow execution failed", {
        workflow: this.definition.name,
        executionId: this.executionId,
        error: error.message,
        step: this.state.currentStep,
      });

      // Handle error with recovery options
      const errorResult = await this.handleError(error);

      // Complete progress tracking with error
      progressTracker.completeTracking(this.executionId, errorResult);

      // Complete monitoring with error
      workflowMonitor.completeExecution(this.executionId, errorResult);

      // Cleanup managed components on error
      await this.cleanupManagedComponents();

      return errorResult;
    }
  }

  /**
   * Execute workflow steps with orchestration patterns
   */
  async executeSteps() {
    const { progressTracker } = await import("./ProgressTracker.js");

    // Group steps by execution pattern
    const stepGroups = this.groupStepsByPattern();

    for (const group of stepGroups) {
      if (group.type === "parallel") {
        await this.executeParallelSteps(group.steps, progressTracker);
      } else {
        // Sequential execution (default)
        for (let i = 0; i < group.steps.length; i++) {
          const step = group.steps[i];
          const globalIndex = this.definition.steps.indexOf(step);

          // Check conditional execution
          if (
            step.condition &&
            !(await this.evaluateCondition(step.condition))
          ) {
            log.debug("Skipping step due to condition", {
              workflow: this.definition.name,
              step: step.name,
              condition: step.condition,
            });
            continue;
          }

          this.state.currentStep = step.name;

          // Update progress before executing step
          progressTracker.updateProgress(this.executionId, {
            currentStep: step.name,
            completedSteps: this.steps.filter((s) => s.success).length,
            status: "running",
          });

          await this.executeStep(step, globalIndex);

          // Persist state if resumable
          if (this.options.resumable) {
            await this.persistState();
          }
        }
      }
    }
  }

  /**
   * Execute a single workflow step
   * @param {Object} step - Step definition
   * @param {number} stepIndex - Step index
   */
  async executeStep(step, stepIndex) {
    if (!step.execute || typeof step.execute !== "function") {
      throw new Error(`Step '${step.name}' must have an execute function`);
    }

    const stepStartTime = new Date();
    const componentName = `${this.executionId}_${step.name}`;

    // Log step start
    workflowMonitor.logStep(this.executionId, step, "started");

    // Check for breakpoints
    if (
      workflowMonitor.shouldBreak(this.executionId, step.name, this.context)
    ) {
      // Breakpoint hit - in a real implementation, this would pause execution
      log.debug("Breakpoint hit", {
        step: step.name,
        executionId: this.executionId,
      });
    }

    try {
      // Initialize component lifecycle if step has lifecycle hooks
      if (step.lifecycle) {
        await this.initializeStepComponent(componentName, step, stepIndex);
      }

      // Execute step with timeout
      const stepResult = await this.executeWithTimeout(
        step.execute(this.context, this.state),
        step.timeout || this.options.timeout,
        `Step '${step.name}' timed out`
      );

      // Update component if managed
      if (this.managedComponents.has(componentName)) {
        await componentLifecycleManager.updateComponent(componentName, {
          data: stepResult,
          context: { stepResult, executionTime: new Date() - stepStartTime },
        });
      }

      // Merge step result into workflow state
      if (stepResult && typeof stepResult === "object") {
        this.state.data = { ...this.state.data, ...stepResult };
      }

      // Record step execution
      const stepRecord = {
        name: step.name,
        index: stepIndex,
        result: stepResult,
        duration: new Date() - stepStartTime,
        timestamp: new Date().toISOString(),
        success: true,
        componentName: this.managedComponents.has(componentName)
          ? componentName
          : null,
      };

      this.steps.push(stepRecord);

      // Log step completion
      workflowMonitor.logStep(this.executionId, step, "completed", stepResult);

      // Unmount component if step lifecycle is complete
      if (step.lifecycle && step.lifecycle.unmountAfterExecution !== false) {
        await componentLifecycleManager.unmountComponent(componentName);
      }

      log.debug("Step completed successfully", {
        workflow: this.definition.name,
        step: step.name,
        duration: stepRecord.duration,
        hasLifecycle: !!step.lifecycle,
      });
    } catch (error) {
      // Handle component error if managed
      if (this.managedComponents.has(componentName)) {
        try {
          await componentLifecycleManager.updateComponent(componentName, {
            data: { error: error.message },
            context: { error, phase: "execution" },
          });
        } catch (updateError) {
          log.warn("Failed to update component with error", {
            componentName,
            error: updateError.message,
          });
        }
      }

      // Record failed step
      const failedStepRecord = {
        name: step.name,
        index: stepIndex,
        error: error.message,
        duration: new Date() - stepStartTime,
        timestamp: new Date().toISOString(),
        success: false,
        componentName: this.managedComponents.has(componentName)
          ? componentName
          : null,
      };

      this.steps.push(failedStepRecord);

      // Log step failure
      workflowMonitor.logStep(this.executionId, step, "failed", error);

      throw error;
    }
  }

  /**
   * Execute a promise with timeout
   * @param {Promise} promise - Promise to execute
   * @param {number} timeout - Timeout in milliseconds
   * @param {string} timeoutMessage - Error message for timeout
   */
  async executeWithTimeout(promise, timeout, timeoutMessage) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeout);
      }),
    ]);
  }

  /**
   * Trigger context refresh for dependent components
   */
  async triggerContextRefresh() {
    try {
      const { contextIntegrator } = await import("./ContextIntegrator.js");
      await contextIntegrator.refresh(
        this.definition.contextRefresh,
        this.state.data
      );

      log.debug("Context refresh triggered", {
        workflow: this.definition.name,
        refreshTargets: this.definition.contextRefresh,
      });
    } catch (error) {
      log.error("Context refresh failed", {
        workflow: this.definition.name,
        error: error.message,
      });
      // Don't fail the workflow if context refresh fails
    }
  }

  /**
   * Handle workflow errors with recovery options
   * @param {Error} error - The error that occurred
   */
  async handleError(error) {
    try {
      const { errorHandler } = await import("./ErrorHandler.js");
      const errorResult = await errorHandler.handle(
        error,
        this.context,
        this.state
      );

      return {
        success: false,
        error: errorResult.error,
        executionId: this.executionId,
        duration: this.state.endTime - this.state.startTime,
        stepsExecuted: this.steps.length,
        failedStep: this.state.currentStep,
      };
    } catch (handlerError) {
      log.error("Error handler failed", {
        workflow: this.definition.name,
        originalError: error.message,
        handlerError: handlerError.message,
      });

      // Fallback error response
      return {
        success: false,
        error: {
          message: "An unexpected error occurred",
          retryable: false,
          details: error.message,
        },
        executionId: this.executionId,
        duration: this.state.endTime - this.state.startTime,
        stepsExecuted: this.steps.length,
        failedStep: this.state.currentStep,
      };
    }
  }

  /**
   * Get current workflow state
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.state,
      executionId: this.executionId,
      progress: this.getProgress(),
    };
  }

  /**
   * Get execution progress
   * @returns {Object} Progress information
   */
  getProgress() {
    const totalSteps = this.definition.steps.length;
    const completedSteps = this.steps.filter((s) => s.success).length;
    const failedSteps = this.steps.filter((s) => !s.success).length;

    return {
      totalSteps,
      completedSteps,
      failedSteps,
      currentStep: this.state.currentStep,
      percentage:
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      isComplete:
        this.state.status === "completed" || this.state.status === "failed",
    };
  }

  /**
   * Cancel workflow execution
   */
  async cancel(reason = "User cancelled") {
    if (this.state.status === "running") {
      this.state.status = "cancelled";
      this.state.endTime = new Date();

      log.info("Workflow execution cancelled", {
        workflow: this.definition.name,
        executionId: this.executionId,
        step: this.state.currentStep,
        reason,
      });

      // Cancel progress tracking
      if (this.progressTracker) {
        this.progressTracker.cancelTracking(this.executionId, reason);
      }
    }
  }

  /**
   * Generate unique execution ID
   * @private
   */
  generateExecutionId() {
    return `${this.definition.name}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  /**
   * Group steps by execution pattern (sequential vs parallel)
   * @private
   */
  groupStepsByPattern() {
    const groups = [];
    let currentGroup = { type: "sequential", steps: [] };

    for (const step of this.definition.steps) {
      if (step.parallel) {
        // Start or continue parallel group
        if (currentGroup.type !== "parallel") {
          if (currentGroup.steps.length > 0) {
            groups.push(currentGroup);
          }
          currentGroup = { type: "parallel", steps: [] };
        }
        currentGroup.steps.push(step);
      } else {
        // Start or continue sequential group
        if (currentGroup.type !== "sequential") {
          if (currentGroup.steps.length > 0) {
            groups.push(currentGroup);
          }
          currentGroup = { type: "sequential", steps: [] };
        }
        currentGroup.steps.push(step);
      }
    }

    if (currentGroup.steps.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Execute parallel steps with result aggregation
   * @private
   */
  async executeParallelSteps(steps, progressTracker) {
    log.debug("Executing parallel steps", {
      workflow: this.definition.name,
      stepCount: steps.length,
      stepNames: steps.map((s) => s.name),
    });

    const stepPromises = steps.map(async (step, index) => {
      // Check conditional execution
      if (step.condition && !(await this.evaluateCondition(step.condition))) {
        log.debug("Skipping parallel step due to condition", {
          workflow: this.definition.name,
          step: step.name,
          condition: step.condition,
        });
        return { step, skipped: true };
      }

      const globalIndex = this.definition.steps.indexOf(step);

      try {
        await this.executeStep(step, globalIndex);
        return { step, success: true };
      } catch (error) {
        return { step, success: false, error };
      }
    });

    const results = await Promise.allSettled(stepPromises);

    // Process results and handle any failures
    const failures = results
      .filter(
        (r) =>
          r.status === "rejected" ||
          (r.value && !r.value.success && !r.value.skipped)
      )
      .map((r) => (r.status === "rejected" ? r.reason : r.value.error));

    if (failures.length > 0) {
      throw new Error(
        `Parallel execution failed: ${failures
          .map((f) => f.message)
          .join(", ")}`
      );
    }

    // Update progress after parallel completion
    progressTracker.updateProgress(this.executionId, {
      completedSteps: this.steps.filter((s) => s.success).length,
      status: "running",
    });
  }

  /**
   * Evaluate conditional execution
   * @private
   */
  async evaluateCondition(condition) {
    try {
      if (typeof condition === "function") {
        return await condition(this.context, this.state);
      } else if (typeof condition === "string") {
        // Simple property-based conditions
        const [property, operator, value] = condition.split(" ");
        const actualValue = this.getNestedProperty(this.state.data, property);

        switch (operator) {
          case "===":
            return actualValue === value;
          case "!==":
            return actualValue !== value;
          case ">":
            return Number(actualValue) > Number(value);
          case "<":
            return Number(actualValue) < Number(value);
          case "exists":
            return actualValue !== undefined && actualValue !== null;
          case "empty":
            return (
              !actualValue ||
              (Array.isArray(actualValue) && actualValue.length === 0)
            );
          default:
            return Boolean(actualValue);
        }
      }
      return Boolean(condition);
    } catch (error) {
      log.warn("Condition evaluation failed, defaulting to false", {
        workflow: this.definition.name,
        condition,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get nested property from object
   * @private
   */
  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Resolve workflow dependencies
   * @private
   */
  async resolveDependencies() {
    if (
      !this.definition.dependencies ||
      this.definition.dependencies.length === 0
    ) {
      return;
    }

    log.debug("Resolving workflow dependencies", {
      workflow: this.definition.name,
      dependencies: this.definition.dependencies,
    });

    const { workflowRegistry } = await import("./WorkflowRegistry.js");

    for (const dependency of this.definition.dependencies) {
      const dependencyResult = await workflowRegistry.execute(
        dependency.workflow,
        dependency.context || this.context,
        { ...dependency.options, timeout: dependency.timeout || 10000 }
      );

      if (!dependencyResult.success) {
        throw new Error(
          `Dependency '${dependency.workflow}' failed: ${dependencyResult.error?.message}`
        );
      }

      // Merge dependency results into context
      if (dependency.mergeResults !== false) {
        this.context = { ...this.context, ...dependencyResult.data };
      }
    }
  }

  /**
   * Persist workflow state for resumable execution
   * @private
   */
  async persistState() {
    if (!this.options.resumable) return;

    try {
      const stateData = {
        executionId: this.executionId,
        definition: this.definition,
        context: this.context,
        state: this.state,
        steps: this.steps,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage for client-side persistence
      // In production, this could be database storage
      localStorage.setItem(
        `workflow_state_${this.executionId}`,
        JSON.stringify(stateData)
      );

      log.debug("Workflow state persisted", {
        workflow: this.definition.name,
        executionId: this.executionId,
      });
    } catch (error) {
      log.warn("Failed to persist workflow state", {
        workflow: this.definition.name,
        executionId: this.executionId,
        error: error.message,
      });
    }
  }

  /**
   * Load persisted workflow state
   * @private
   */
  async loadPersistedState() {
    if (!this.options.resumable) return;

    try {
      const persistedData = localStorage.getItem(
        `workflow_state_${this.executionId}`
      );
      if (persistedData) {
        const stateData = JSON.parse(persistedData);

        // Restore state
        this.state = stateData.state;
        this.steps = stateData.steps || [];
        this.context = { ...this.context, ...stateData.context };

        log.info("Workflow state restored from persistence", {
          workflow: this.definition.name,
          executionId: this.executionId,
          completedSteps: this.steps.length,
        });
      }
    } catch (error) {
      log.warn("Failed to load persisted workflow state", {
        workflow: this.definition.name,
        executionId: this.executionId,
        error: error.message,
      });
    }
  }

  /**
   * Clean up persisted state after successful completion
   * @private
   */
  async cleanupPersistedState() {
    if (!this.options.resumable) return;

    try {
      localStorage.removeItem(`workflow_state_${this.executionId}`);
      log.debug("Persisted workflow state cleaned up", {
        workflow: this.definition.name,
        executionId: this.executionId,
      });
    } catch (error) {
      log.warn("Failed to cleanup persisted workflow state", {
        workflow: this.definition.name,
        executionId: this.executionId,
        error: error.message,
      });
    }
  }

  /**
   * Initialize step component with lifecycle management
   * @private
   */
  async initializeStepComponent(componentName, step, stepIndex) {
    try {
      // Register lifecycle hooks if provided
      if (step.lifecycle.hooks) {
        componentLifecycleManager.registerLifecycleHooks(
          componentName,
          step.lifecycle.hooks
        );
      }

      // Register error boundary if provided
      if (step.lifecycle.errorBoundary) {
        componentLifecycleManager.registerErrorBoundary(
          componentName,
          step.lifecycle.errorBoundary
        );
      }

      // Initialize component
      await componentLifecycleManager.initializeComponent(
        componentName,
        {
          stepName: step.name,
          stepIndex,
          workflowName: this.definition.name,
          executionId: this.executionId,
          ...step.lifecycle.context,
        },
        step.lifecycle.options
      );

      // Mount component if auto-mount is enabled (default)
      if (step.lifecycle.autoMount !== false) {
        await componentLifecycleManager.mountComponent(componentName, {
          workflowContext: this.context,
          workflowState: this.state,
        });
      }

      this.managedComponents.add(componentName);

      log.debug("Step component initialized", {
        workflow: this.definition.name,
        step: step.name,
        componentName,
      });
    } catch (error) {
      log.error("Failed to initialize step component", {
        workflow: this.definition.name,
        step: step.name,
        componentName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Cleanup all managed components
   * @private
   */
  async cleanupManagedComponents() {
    if (this.managedComponents.size === 0) {
      return;
    }

    log.debug("Cleaning up managed components", {
      workflow: this.definition.name,
      componentCount: this.managedComponents.size,
    });

    const cleanupPromises = Array.from(this.managedComponents).map(
      async (componentName) => {
        try {
          await componentLifecycleManager.destroyComponent(componentName, {
            reason: "workflow_cleanup",
            workflowName: this.definition.name,
            executionId: this.executionId,
          });
        } catch (error) {
          log.warn("Failed to cleanup component", {
            componentName,
            error: error.message,
          });
        }
      }
    );

    await Promise.allSettled(cleanupPromises);
    this.managedComponents.clear();

    log.debug("Managed components cleanup completed", {
      workflow: this.definition.name,
    });
  }

  /**
   * Get managed component states
   */
  getManagedComponentStates() {
    const componentStates = {};

    for (const componentName of this.managedComponents) {
      const state = componentLifecycleManager.getComponentState(componentName);
      if (state) {
        componentStates[componentName] = {
          state: state.state,
          createdAt: state.createdAt,
          lastUpdated: state.lastUpdated,
          errors: state.errors.length,
        };
      }
    }

    return componentStates;
  }

  /**
   * Sanitize context for logging
   * @private
   */
  sanitizeContext(context) {
    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveFields = ["password", "token", "apiKey", "secret"];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}

export default WorkflowInstance;
