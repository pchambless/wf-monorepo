/**
 * Workflow Orchestrator
 *
 * Provides advanced workflow orchestration patterns including:
 * - Conditional execution
 * - Parallel execution
 * - Workflow composition
 * - State persistence
 * - Dependency management
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("WorkflowOrchestrator");

class WorkflowOrchestrator {
  constructor() {
    this.activeOrchestrations = new Map();
    this.orchestrationHistory = [];
    this.stateStore = new Map();
  }

  /**
   * Execute workflows in parallel
   * @param {Array} workflows - Array of workflow definitions
   * @param {Object} sharedContext - Shared context for all workflows
   * @param {Object} options - Orchestration options
   * @returns {Promise<Object>} Orchestration result
   */
  async executeParallel(workflows, sharedContext = {}, options = {}) {
    const orchestrationId = this.generateOrchestrationId("parallel");

    log.info("Starting parallel workflow execution", {
      orchestrationId,
      workflowCount: workflows.length,
      workflows: workflows.map((w) => w.name),
    });

    try {
      // Start orchestration tracking
      this.startOrchestrationTracking(
        orchestrationId,
        "parallel",
        workflows,
        sharedContext
      );

      // Import workflow registry
      const { workflowRegistry } = await import("../WorkflowRegistry.js");

      // Execute all workflows in parallel
      const workflowPromises = workflows.map(async (workflow, index) => {
        try {
          const workflowContext = {
            ...sharedContext,
            ...workflow.context,
            orchestrationId,
            workflowIndex: index,
          };

          const result = await workflowRegistry.execute(
            workflow.name,
            workflowContext,
            workflow.options
          );

          return {
            workflowName: workflow.name,
            index,
            success: true,
            result,
          };
        } catch (error) {
          log.error("Parallel workflow failed", {
            workflowName: workflow.name,
            index,
            error: error.message,
          });

          return {
            workflowName: workflow.name,
            index,
            success: false,
            error: error.message,
          };
        }
      });

      // Wait for all workflows to complete
      const results = await Promise.allSettled(workflowPromises);

      // Process results
      const successfulResults = [];
      const failedResults = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successfulResults.push(result.value);
          } else {
            failedResults.push(result.value);
          }
        } else {
          failedResults.push({
            workflowName: workflows[index].name,
            index,
            success: false,
            error: result.reason?.message || "Unknown error",
          });
        }
      });

      const orchestrationResult = {
        orchestrationId,
        type: "parallel",
        success: failedResults.length === 0,
        totalWorkflows: workflows.length,
        successfulWorkflows: successfulResults.length,
        failedWorkflows: failedResults.length,
        results: successfulResults,
        errors: failedResults,
        aggregatedData: this.aggregateResults(successfulResults),
      };

      // Complete orchestration tracking
      this.completeOrchestrationTracking(orchestrationId, orchestrationResult);

      log.info("Parallel workflow execution completed", {
        orchestrationId,
        successful: successfulResults.length,
        failed: failedResults.length,
      });

      return orchestrationResult;
    } catch (error) {
      log.error("Parallel orchestration failed", {
        orchestrationId,
        error: error.message,
      });

      const errorResult = {
        orchestrationId,
        type: "parallel",
        success: false,
        error: error.message,
      };

      this.completeOrchestrationTracking(orchestrationId, errorResult);
      throw error;
    }
  }

  /**
   * Execute workflows in sequence with conditional logic
   * @param {Array} workflows - Array of workflow definitions with conditions
   * @param {Object} context - Execution context
   * @param {Object} options - Orchestration options
   * @returns {Promise<Object>} Orchestration result
   */
  async executeSequential(workflows, context = {}, options = {}) {
    const orchestrationId = this.generateOrchestrationId("sequential");

    log.info("Starting sequential workflow execution", {
      orchestrationId,
      workflowCount: workflows.length,
    });

    try {
      this.startOrchestrationTracking(
        orchestrationId,
        "sequential",
        workflows,
        context
      );

      const { workflowRegistry } = await import("../WorkflowRegistry.js");
      const results = [];
      let currentContext = { ...context, orchestrationId };

      for (let i = 0; i < workflows.length; i++) {
        const workflow = workflows[i];

        // Check condition if specified
        if (
          workflow.condition &&
          !this.evaluateCondition(workflow.condition, currentContext)
        ) {
          log.debug("Skipping workflow due to condition", {
            workflowName: workflow.name,
            condition: workflow.condition,
          });

          results.push({
            workflowName: workflow.name,
            index: i,
            skipped: true,
            reason: "Condition not met",
          });
          continue;
        }

        try {
          const workflowContext = {
            ...currentContext,
            ...workflow.context,
            workflowIndex: i,
            previousResults: results,
          };

          const result = await workflowRegistry.execute(
            workflow.name,
            workflowContext,
            workflow.options
          );

          results.push({
            workflowName: workflow.name,
            index: i,
            success: true,
            result,
          });

          // Update context with result data for next workflow
          if (result.data) {
            currentContext = {
              ...currentContext,
              ...result.data,
              [`${workflow.name}_result`]: result,
            };
          }
        } catch (error) {
          log.error("Sequential workflow failed", {
            workflowName: workflow.name,
            index: i,
            error: error.message,
          });

          results.push({
            workflowName: workflow.name,
            index: i,
            success: false,
            error: error.message,
          });

          // Check if we should continue on error
          if (!workflow.continueOnError && !options.continueOnError) {
            break;
          }
        }
      }

      const successfulResults = results.filter((r) => r.success);
      const failedResults = results.filter((r) => !r.success && !r.skipped);
      const skippedResults = results.filter((r) => r.skipped);

      const orchestrationResult = {
        orchestrationId,
        type: "sequential",
        success: failedResults.length === 0,
        totalWorkflows: workflows.length,
        successfulWorkflows: successfulResults.length,
        failedWorkflows: failedResults.length,
        skippedWorkflows: skippedResults.length,
        results: successfulResults,
        errors: failedResults,
        skipped: skippedResults,
        finalContext: currentContext,
        aggregatedData: this.aggregateResults(successfulResults),
      };

      this.completeOrchestrationTracking(orchestrationId, orchestrationResult);

      log.info("Sequential workflow execution completed", {
        orchestrationId,
        successful: successfulResults.length,
        failed: failedResults.length,
        skipped: skippedResults.length,
      });

      return orchestrationResult;
    } catch (error) {
      log.error("Sequential orchestration failed", {
        orchestrationId,
        error: error.message,
      });

      const errorResult = {
        orchestrationId,
        type: "sequential",
        success: false,
        error: error.message,
      };

      this.completeOrchestrationTracking(orchestrationId, errorResult);
      throw error;
    }
  }

  /**
   * Execute workflows with dependency management
   * @param {Object} workflowGraph - Workflow dependency graph
   * @param {Object} context - Execution context
   * @param {Object} options - Orchestration options
   * @returns {Promise<Object>} Orchestration result
   */
  async executeWithDependencies(workflowGraph, context = {}, options = {}) {
    const orchestrationId = this.generateOrchestrationId("dependency");

    log.info("Starting dependency-based workflow execution", {
      orchestrationId,
      workflows: Object.keys(workflowGraph),
    });

    try {
      this.startOrchestrationTracking(
        orchestrationId,
        "dependency",
        workflowGraph,
        context
      );

      const { workflowRegistry } = await import("../WorkflowRegistry.js");
      const results = new Map();
      const completed = new Set();
      const inProgress = new Set();
      const failed = new Set();

      // Topological sort to determine execution order
      const executionOrder = this.topologicalSort(workflowGraph);

      log.debug("Workflow execution order determined", {
        orchestrationId,
        order: executionOrder,
      });

      // Execute workflows in dependency order
      for (const workflowName of executionOrder) {
        const workflow = workflowGraph[workflowName];

        // Check if all dependencies are completed
        const dependencies = workflow.dependencies || [];
        const unmetDependencies = dependencies.filter(
          (dep) => !completed.has(dep)
        );

        if (unmetDependencies.length > 0) {
          const failedDependencies = unmetDependencies.filter((dep) =>
            failed.has(dep)
          );

          if (failedDependencies.length > 0) {
            log.warn("Skipping workflow due to failed dependencies", {
              workflowName,
              failedDependencies,
            });

            results.set(workflowName, {
              workflowName,
              success: false,
              skipped: true,
              reason: `Failed dependencies: ${failedDependencies.join(", ")}`,
            });
            continue;
          }

          // This shouldn't happen with proper topological sort
          log.error("Unmet dependencies found", {
            workflowName,
            unmetDependencies,
          });
          continue;
        }

        try {
          inProgress.add(workflowName);

          // Gather dependency results for context
          const dependencyResults = {};
          dependencies.forEach((dep) => {
            const depResult = results.get(dep);
            if (depResult && depResult.success) {
              dependencyResults[`${dep}_result`] = depResult.result;
            }
          });

          const workflowContext = {
            ...context,
            ...workflow.context,
            ...dependencyResults,
            orchestrationId,
            dependencies: dependencies,
          };

          const result = await workflowRegistry.execute(
            workflowName,
            workflowContext,
            workflow.options
          );

          results.set(workflowName, {
            workflowName,
            success: true,
            result,
            dependencies,
          });

          completed.add(workflowName);
          inProgress.delete(workflowName);
        } catch (error) {
          log.error("Dependency workflow failed", {
            workflowName,
            error: error.message,
          });

          results.set(workflowName, {
            workflowName,
            success: false,
            error: error.message,
            dependencies,
          });

          failed.add(workflowName);
          inProgress.delete(workflowName);
        }
      }

      const resultArray = Array.from(results.values());
      const successfulResults = resultArray.filter((r) => r.success);
      const failedResults = resultArray.filter((r) => !r.success && !r.skipped);
      const skippedResults = resultArray.filter((r) => r.skipped);

      const orchestrationResult = {
        orchestrationId,
        type: "dependency",
        success: failedResults.length === 0,
        totalWorkflows: Object.keys(workflowGraph).length,
        successfulWorkflows: successfulResults.length,
        failedWorkflows: failedResults.length,
        skippedWorkflows: skippedResults.length,
        results: successfulResults,
        errors: failedResults,
        skipped: skippedResults,
        executionOrder,
        aggregatedData: this.aggregateResults(successfulResults),
      };

      this.completeOrchestrationTracking(orchestrationId, orchestrationResult);

      log.info("Dependency-based workflow execution completed", {
        orchestrationId,
        successful: successfulResults.length,
        failed: failedResults.length,
        skipped: skippedResults.length,
      });

      return orchestrationResult;
    } catch (error) {
      log.error("Dependency orchestration failed", {
        orchestrationId,
        error: error.message,
      });

      const errorResult = {
        orchestrationId,
        type: "dependency",
        success: false,
        error: error.message,
      };

      this.completeOrchestrationTracking(orchestrationId, errorResult);
      throw error;
    }
  }

  /**
   * Persist workflow state for resumable operations
   * @param {string} orchestrationId - Orchestration ID
   * @param {Object} state - State to persist
   */
  persistState(orchestrationId, state) {
    this.stateStore.set(orchestrationId, {
      ...state,
      persistedAt: new Date().toISOString(),
    });

    log.debug("Workflow state persisted", { orchestrationId });
  }

  /**
   * Restore workflow state
   * @param {string} orchestrationId - Orchestration ID
   * @returns {Object|null} Restored state
   */
  restoreState(orchestrationId) {
    const state = this.stateStore.get(orchestrationId);

    if (state) {
      log.debug("Workflow state restored", { orchestrationId });
    }

    return state || null;
  }

  /**
   * Evaluate condition for conditional workflow execution
   * @param {Object} condition - Condition definition
   * @param {Object} context - Execution context
   * @returns {boolean} Condition result
   * @private
   */
  evaluateCondition(condition, context) {
    try {
      // Simple condition evaluation
      if (
        condition.field &&
        condition.operator &&
        condition.value !== undefined
      ) {
        const fieldValue = this.getNestedValue(context, condition.field);

        switch (condition.operator) {
          case "equals":
            return fieldValue === condition.value;
          case "not_equals":
            return fieldValue !== condition.value;
          case "greater_than":
            return fieldValue > condition.value;
          case "less_than":
            return fieldValue < condition.value;
          case "contains":
            return String(fieldValue).includes(condition.value);
          case "exists":
            return fieldValue !== undefined && fieldValue !== null;
          default:
            log.warn("Unknown condition operator", {
              operator: condition.operator,
            });
            return false;
        }
      }

      // Function-based condition
      if (typeof condition === "function") {
        return condition(context);
      }

      // Boolean condition
      if (typeof condition === "boolean") {
        return condition;
      }

      return false;
    } catch (error) {
      log.error("Error evaluating condition", {
        condition,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {*} Value at path
   * @private
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Perform topological sort on workflow dependency graph
   * @param {Object} workflowGraph - Workflow dependency graph
   * @returns {Array} Sorted workflow names
   * @private
   */
  topologicalSort(workflowGraph) {
    const visited = new Set();
    const visiting = new Set();
    const result = [];

    const visit = (workflowName) => {
      if (visiting.has(workflowName)) {
        throw new Error(
          `Circular dependency detected involving: ${workflowName}`
        );
      }

      if (visited.has(workflowName)) {
        return;
      }

      visiting.add(workflowName);

      const workflow = workflowGraph[workflowName];
      const dependencies = workflow?.dependencies || [];

      dependencies.forEach((dep) => {
        if (!workflowGraph[dep]) {
          throw new Error(
            `Dependency not found: ${dep} (required by ${workflowName})`
          );
        }
        visit(dep);
      });

      visiting.delete(workflowName);
      visited.add(workflowName);
      result.push(workflowName);
    };

    Object.keys(workflowGraph).forEach((workflowName) => {
      if (!visited.has(workflowName)) {
        visit(workflowName);
      }
    });

    return result;
  }

  /**
   * Aggregate results from multiple workflows
   * @param {Array} results - Array of workflow results
   * @returns {Object} Aggregated data
   * @private
   */
  aggregateResults(results) {
    const aggregated = {
      totalDuration: 0,
      totalStepsExecuted: 0,
      combinedData: {},
    };

    results.forEach((result) => {
      if (result.result) {
        aggregated.totalDuration += result.result.duration || 0;
        aggregated.totalStepsExecuted += result.result.stepsExecuted || 0;

        if (result.result.data) {
          aggregated.combinedData[result.workflowName] = result.result.data;
        }
      }
    });

    return aggregated;
  }

  /**
   * Start orchestration tracking
   * @param {string} orchestrationId - Orchestration ID
   * @param {string} type - Orchestration type
   * @param {*} workflows - Workflow definitions
   * @param {Object} context - Execution context
   * @private
   */
  startOrchestrationTracking(orchestrationId, type, workflows, context) {
    const tracking = {
      orchestrationId,
      type,
      workflows: Array.isArray(workflows)
        ? workflows.map((w) => w.name)
        : Object.keys(workflows),
      startTime: new Date(),
      status: "running",
    };

    this.activeOrchestrations.set(orchestrationId, tracking);
  }

  /**
   * Complete orchestration tracking
   * @param {string} orchestrationId - Orchestration ID
   * @param {Object} result - Orchestration result
   * @private
   */
  completeOrchestrationTracking(orchestrationId, result) {
    const tracking = this.activeOrchestrations.get(orchestrationId);

    if (tracking) {
      tracking.endTime = new Date();
      tracking.duration = tracking.endTime - tracking.startTime;
      tracking.status = result.success ? "completed" : "failed";
      tracking.result = result;

      // Move to history
      this.orchestrationHistory.push(tracking);
      this.activeOrchestrations.delete(orchestrationId);

      // Keep only last 100 orchestrations
      if (this.orchestrationHistory.length > 100) {
        this.orchestrationHistory = this.orchestrationHistory.slice(-100);
      }
    }
  }

  /**
   * Generate unique orchestration ID
   * @param {string} type - Orchestration type
   * @returns {string} Unique ID
   * @private
   */
  generateOrchestrationId(type) {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active orchestrations
   * @returns {Array} Active orchestrations
   */
  getActiveOrchestrations() {
    return Array.from(this.activeOrchestrations.values());
  }

  /**
   * Get orchestration history
   * @param {number} limit - Number of recent orchestrations to return
   * @returns {Array} Orchestration history
   */
  getOrchestrationHistory(limit = 10) {
    return this.orchestrationHistory.slice(-limit);
  }

  /**
   * Clear orchestration data (mainly for testing)
   */
  clearData() {
    this.activeOrchestrations.clear();
    this.orchestrationHistory = [];
    this.stateStore.clear();
    log.debug("Orchestration data cleared");
  }
}

// Create singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator();

// Export class for testing
export { WorkflowOrchestrator };

export default workflowOrchestrator;
