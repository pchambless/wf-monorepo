/**
 * Workflow Registry
 *
 * Central registry for managing workflow definitions and execution
 * Provides unified interface for workflow registration and execution
 */

import { createLogger } from "@whatsfresh/shared-imports";
import {
  getRegisteredWorkflows,
  getWorkflowDocumentation,
  validateWorkflowDocumentation,
} from "../config/workflowConfig.js";

const log = createLogger("WorkflowRegistry");

class WorkflowRegistry {
  constructor() {
    this.workflows = new Map();
    this.middleware = [];
    this.executionHistory = [];
  }

  /**
   * Register a workflow definition
   * @param {string|Object} nameOrDefinition - Workflow name or definition object
   * @param {Object} workflowDefinition - Workflow definition object (if first param is string)
   */
  register(nameOrDefinition, workflowDefinition) {
    let name, definition;

    // Support both register(name, definition) and register(definition) patterns
    if (typeof nameOrDefinition === "string") {
      name = nameOrDefinition;
      definition = workflowDefinition;
    } else {
      definition = nameOrDefinition;
      name = definition.name;
    }

    if (!name || typeof name !== "string") {
      throw new Error("Workflow name must be a non-empty string");
    }

    if (!definition || !definition.steps) {
      throw new Error("Workflow definition must have steps array");
    }

    // Validate against config documentation
    const configValidation = validateWorkflowDocumentation(name);
    if (!configValidation.valid) {
      log.warn("Workflow not documented in config", {
        name,
        errors: configValidation.errors,
        warnings: configValidation.warnings,
      });
    }

    // Merge with config documentation if available
    const configDoc = getWorkflowDocumentation(name);
    if (configDoc) {
      definition = {
        ...definition,
        timeout: definition.timeout || configDoc.timeout,
        category: definition.category || configDoc.category,
        contextRefresh: definition.contextRefresh || configDoc.contextRefresh,
        errorHandling: definition.errorHandling || configDoc.errorHandling,
        retryable:
          definition.retryable !== undefined
            ? definition.retryable
            : configDoc.retryable,
        configDocumentation: configDoc,
      };
    }

    // Validate orchestration features
    this.validateWorkflowDefinition(definition);

    this.workflows.set(name, {
      ...definition,
      name,
      registeredAt: new Date().toISOString(),
    });

    log.debug("Workflow registered", {
      name,
      stepsCount: definition.steps.length,
      hasOrchestration: this.hasOrchestrationFeatures(definition),
      hasConfigDoc: !!configDoc,
      category: definition.category,
    });
  }

  /**
   * Validate workflow definition for orchestration features
   * @private
   */
  validateWorkflowDefinition(definition) {
    // Validate dependencies
    if (definition.dependencies) {
      if (!Array.isArray(definition.dependencies)) {
        throw new Error("Workflow dependencies must be an array");
      }

      definition.dependencies.forEach((dep, index) => {
        if (!dep.workflow) {
          throw new Error(`Dependency ${index} must have a workflow property`);
        }
      });
    }

    // Validate steps for orchestration features
    definition.steps.forEach((step, index) => {
      if (
        step.condition &&
        typeof step.condition !== "string" &&
        typeof step.condition !== "function"
      ) {
        throw new Error(`Step ${index} condition must be a string or function`);
      }

      if (step.parallel && typeof step.parallel !== "boolean") {
        throw new Error(`Step ${index} parallel flag must be boolean`);
      }

      if (
        step.timeout &&
        (typeof step.timeout !== "number" || step.timeout <= 0)
      ) {
        throw new Error(`Step ${index} timeout must be a positive number`);
      }
    });
  }

  /**
   * Check if workflow definition has orchestration features
   * @private
   */
  hasOrchestrationFeatures(definition) {
    return !!(
      definition.dependencies ||
      definition.steps.some(
        (step) => step.condition || step.parallel || step.timeout
      )
    );
  }

  /**
   * Execute a workflow by name
   * @param {string} workflowName - Name of workflow to execute
   * @param {Object} context - Execution context
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async execute(workflowName, context = {}, options = {}) {
    const definition = this.workflows.get(workflowName);
    if (!definition) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    log.info("Executing workflow", {
      workflowName,
      context: this.sanitizeContext(context),
    });

    try {
      // Apply middleware before execution
      const processedContext = await this.applyMiddleware(
        "before",
        context,
        definition
      );

      // Create and execute workflow instance
      const { WorkflowInstance } = await import("./WorkflowInstance.js");
      const instance = new WorkflowInstance(
        definition,
        processedContext,
        options
      );
      const result = await instance.execute();

      // Apply middleware after execution
      await this.applyMiddleware("after", processedContext, definition, result);

      // Record execution history
      this.recordExecution(workflowName, processedContext, result);

      log.info("Workflow execution completed", {
        workflowName,
        success: result.success,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      log.error("Workflow execution failed", {
        workflowName,
        error: error.message,
      });

      // Record failed execution
      this.recordExecution(workflowName, context, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Add middleware for cross-cutting concerns
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }

    this.middleware.push(middleware);
    log.debug("Middleware added", { middlewareCount: this.middleware.length });
  }

  /**
   * Apply middleware functions
   * @param {string} phase - 'before' or 'after'
   * @param {Object} context - Execution context
   * @param {Object} definition - Workflow definition
   * @param {Object} result - Execution result (for 'after' phase)
   */
  async applyMiddleware(phase, context, definition, result = null) {
    let processedContext = context;

    for (const middleware of this.middleware) {
      try {
        const middlewareResult = await middleware(
          phase,
          processedContext,
          definition,
          result
        );
        if (phase === "before" && middlewareResult) {
          processedContext = middlewareResult;
        }
      } catch (error) {
        log.error("Middleware execution failed", {
          phase,
          error: error.message,
        });
        // Continue execution - middleware failures shouldn't break workflows
      }
    }

    return processedContext;
  }

  /**
   * Get registered workflow definition
   * @param {string} name - Workflow name
   * @returns {Object|null} Workflow definition or null if not found
   */
  getWorkflow(name) {
    return this.workflows.get(name) || null;
  }

  /**
   * List all registered workflows
   * @returns {Array} Array of workflow names
   */
  listWorkflows() {
    return Array.from(this.workflows.keys());
  }

  /**
   * Get workflow execution statistics
   * @param {string} workflowName - Optional workflow name filter
   * @returns {Object} Execution statistics
   */
  getExecutionStats(workflowName = null) {
    const filteredHistory = workflowName
      ? this.executionHistory.filter((h) => h.workflowName === workflowName)
      : this.executionHistory;

    const totalExecutions = filteredHistory.length;
    const successfulExecutions = filteredHistory.filter(
      (h) => h.result.success
    ).length;
    const failedExecutions = totalExecutions - successfulExecutions;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate:
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0,
      recentExecutions: filteredHistory.slice(-10), // Last 10 executions
    };
  }

  /**
   * Register a workflow composition
   * @param {string} name - Composition name
   * @param {Object} composition - Composition definition from WorkflowComposer
   */
  registerComposition(name, composition) {
    if (!name || typeof name !== "string") {
      throw new Error("Composition name must be a non-empty string");
    }

    if (!composition || typeof composition.execute !== "function") {
      throw new Error("Composition must have an execute function");
    }

    // Create a workflow-like wrapper for the composition
    const compositionWrapper = {
      name,
      type: "composition",
      compositionType: composition.type,
      steps: [
        {
          name: "executeComposition",
          execute: composition.execute,
        },
      ],
      originalComposition: composition,
      registeredAt: new Date().toISOString(),
    };

    this.workflows.set(name, compositionWrapper);

    log.debug("Workflow composition registered", {
      name,
      type: composition.type,
      compositionType: composition.type,
    });
  }

  /**
   * Execute a workflow composition
   * @param {string} compositionName - Name of composition to execute
   * @param {Object} context - Execution context
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeComposition(compositionName, context = {}, options = {}) {
    const composition = this.workflows.get(compositionName);
    if (!composition || composition.type !== "composition") {
      throw new Error(`Composition '${compositionName}' not found`);
    }

    log.info("Executing workflow composition", {
      compositionName,
      type: composition.compositionType,
      context: this.sanitizeContext(context),
    });

    try {
      const result = await composition.originalComposition.execute(
        context,
        options
      );

      // Record execution history
      this.recordExecution(compositionName, context, result);

      log.info("Workflow composition completed", {
        compositionName,
        success: result.success,
        type: composition.compositionType,
      });

      return result;
    } catch (error) {
      log.error("Workflow composition failed", {
        compositionName,
        error: error.message,
      });

      // Record failed execution
      this.recordExecution(compositionName, context, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Create and register a sequential workflow composition
   * @param {string} name - Composition name
   * @param {Array} workflows - Array of workflow names
   * @param {Object} options - Composition options
   */
  createSequential(name, workflows, options = {}) {
    const { workflowComposer } = require("./WorkflowComposer.js");
    const composition = workflowComposer.createSequential(
      name,
      workflows,
      options
    );
    this.registerComposition(name, composition);
    return composition;
  }

  /**
   * Create and register a parallel workflow composition
   * @param {string} name - Composition name
   * @param {Array} workflows - Array of workflow names
   * @param {Object} options - Composition options
   */
  createParallel(name, workflows, options = {}) {
    const { workflowComposer } = require("./WorkflowComposer.js");
    const composition = workflowComposer.createParallel(
      name,
      workflows,
      options
    );
    this.registerComposition(name, composition);
    return composition;
  }

  /**
   * Create and register a conditional workflow composition
   * @param {string} name - Composition name
   * @param {Object} conditions - Condition-to-workflow mappings
   * @param {Object} options - Composition options
   */
  createConditional(name, conditions, options = {}) {
    const { workflowComposer } = require("./WorkflowComposer.js");
    const composition = workflowComposer.createConditional(
      name,
      conditions,
      options
    );
    this.registerComposition(name, composition);
    return composition;
  }

  /**
   * Create and register a retry workflow composition
   * @param {string} name - Composition name
   * @param {string} workflow - Workflow to wrap with retry
   * @param {Object} options - Retry options
   */
  createRetry(name, workflow, options = {}) {
    const { workflowComposer } = require("./WorkflowComposer.js");
    const composition = workflowComposer.createRetry(name, workflow, options);
    this.registerComposition(name, composition);
    return composition;
  }

  /**
   * List all registered workflows and compositions
   * @returns {Object} Object with workflows and compositions arrays
   */
  listAll() {
    const all = Array.from(this.workflows.values());
    return {
      workflows: all.filter((w) => w.type !== "composition"),
      compositions: all.filter((w) => w.type === "composition"),
      total: all.length,
    };
  }

  /**
   * Get workflows by category from config documentation
   * @param {string} category - Workflow category
   * @returns {Array} Workflows in the specified category
   */
  getWorkflowsByCategory(category) {
    const all = Array.from(this.workflows.values());
    return all.filter(
      (w) =>
        w.category === category || w.configDocumentation?.category === category
    );
  }

  /**
   * Validate all registered workflows against config documentation
   * @returns {Object} Validation summary
   */
  validateAllWorkflows() {
    const registeredWorkflows = this.listWorkflows();
    const configWorkflows = getRegisteredWorkflows();

    const validationResults = {
      registered: registeredWorkflows.length,
      documented: configWorkflows.length,
      validated: [],
      undocumented: [],
      unregistered: [],
    };

    // Check registered workflows against config
    for (const workflowName of registeredWorkflows) {
      const validation = validateWorkflowDocumentation(workflowName);
      if (validation.valid) {
        validationResults.validated.push(workflowName);
      } else {
        validationResults.undocumented.push({
          name: workflowName,
          errors: validation.errors,
          warnings: validation.warnings,
        });
      }
    }

    // Check for workflows documented but not registered
    const configWorkflowNames = configWorkflows.map((w) => w.value);
    for (const configWorkflowName of configWorkflowNames) {
      if (!registeredWorkflows.includes(configWorkflowName)) {
        validationResults.unregistered.push(configWorkflowName);
      }
    }

    return validationResults;
  }

  /**
   * Auto-register workflows from config documentation
   * Creates placeholder workflow definitions for documented workflows
   * @param {Object} options - Registration options
   */
  autoRegisterFromConfig(options = {}) {
    const configWorkflows = getRegisteredWorkflows();
    const registeredCount = 0;

    for (const configWorkflow of configWorkflows) {
      const workflowName = configWorkflow.value;

      // Skip if already registered
      if (this.workflows.has(workflowName)) {
        continue;
      }

      // Create placeholder workflow definition
      const placeholderDefinition = {
        name: workflowName,
        description: configWorkflow.description,
        category: configWorkflow.category,
        timeout: configWorkflow.timeout,
        contextRefresh: configWorkflow.contextRefresh,
        errorHandling: configWorkflow.errorHandling,
        retryable: configWorkflow.retryable,
        steps: configWorkflow.steps?.map((stepName) => ({
          name: stepName,
          execute: async (context, state) => {
            throw new Error(
              `Step '${stepName}' in workflow '${workflowName}' is not implemented. This is a placeholder from config documentation.`
            );
          },
        })) || [
          {
            name: "placeholder",
            execute: async (context, state) => {
              throw new Error(
                `Workflow '${workflowName}' is documented in config but not implemented. Please implement the workflow steps.`
              );
            },
          },
        ],
        isPlaceholder: true,
        configDocumentation: configWorkflow,
      };

      if (options.registerPlaceholders !== false) {
        this.register(placeholderDefinition);
        registeredCount++;

        log.info("Auto-registered placeholder workflow from config", {
          name: workflowName,
          category: configWorkflow.category,
          stepsFromConfig: configWorkflow.steps?.length || 0,
        });
      }
    }

    return {
      registered: registeredCount,
      total: configWorkflows.length,
    };
  }

  /**
   * Get workflow documentation status
   * @param {string} workflowName - Optional workflow name filter
   * @returns {Object} Documentation status
   */
  getDocumentationStatus(workflowName = null) {
    if (workflowName) {
      const workflow = this.getWorkflow(workflowName);
      const configDoc = getWorkflowDocumentation(workflowName);
      const validation = validateWorkflowDocumentation(workflowName);

      return {
        name: workflowName,
        registered: !!workflow,
        documented: !!configDoc,
        isPlaceholder: workflow?.isPlaceholder || false,
        validation,
        configDocumentation: configDoc,
        registeredDefinition: workflow
          ? {
              stepsCount: workflow.steps?.length || 0,
              hasTimeout: !!workflow.timeout,
              hasCategory: !!workflow.category,
              registeredAt: workflow.registeredAt,
            }
          : null,
      };
    }

    // Return status for all workflows
    const allWorkflows = new Set([
      ...this.listWorkflows(),
      ...getRegisteredWorkflows().map((w) => w.value),
    ]);

    return Array.from(allWorkflows).map((name) =>
      this.getDocumentationStatus(name)
    );
  }

  /**
   * Clear workflow registry (mainly for testing)
   */
  clear() {
    this.workflows.clear();
    this.middleware = [];
    this.executionHistory = [];
    log.debug("Workflow registry cleared");
  }

  /**
   * Record workflow execution for analytics
   * @private
   */
  recordExecution(workflowName, context, result) {
    this.executionHistory.push({
      workflowName,
      context: this.sanitizeContext(context),
      result: {
        success: result.success,
        duration: result.duration,
        error: result.error?.message,
      },
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 executions to prevent memory issues
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }
  }

  /**
   * Sanitize context for logging (remove sensitive data)
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

// Create singleton instance
export const workflowRegistry = new WorkflowRegistry();

// Export class for testing
export { WorkflowRegistry };

export default workflowRegistry;
