/**
 * Workflow Composer
 *
 * Provides patterns for composing complex workflows from simpler ones
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("WorkflowComposer");

export class WorkflowComposer {
  constructor() {
    this.compositions = new Map();
  }

  /**
   * Create a sequential composition of workflows
   * @param {string} name - Composition name
   * @param {Array} workflows - Array of workflow definitions or names
   * @param {Object} options - Composition options
   */
  createSequential(name, workflows, options = {}) {
    const composition = {
      name,
      type: "sequential",
      workflows,
      options: {
        failFast: true,
        passDataBetween: true,
        ...options,
      },
      execute: async (context, compositionOptions = {}) => {
        return this.executeSequential(workflows, context, {
          ...options,
          ...compositionOptions,
        });
      },
    };

    this.compositions.set(name, composition);
    return composition;
  }

  /**
   * Create a parallel composition of workflows
   * @param {string} name - Composition name
   * @param {Array} workflows - Array of workflow definitions or names
   * @param {Object} options - Composition options
   */
  createParallel(name, workflows, options = {}) {
    const composition = {
      name,
      type: "parallel",
      workflows,
      options: {
        failFast: false,
        aggregateResults: true,
        ...options,
      },
      execute: async (context, compositionOptions = {}) => {
        return this.executeParallel(workflows, context, {
          ...options,
          ...compositionOptions,
        });
      },
    };

    this.compositions.set(name, composition);
    return composition;
  }

  /**
   * Create a conditional composition of workflows
   * @param {string} name - Composition name
   * @param {Object} conditions - Condition-to-workflow mappings
   * @param {Object} options - Composition options
   */
  createConditional(name, conditions, options = {}) {
    const composition = {
      name,
      type: "conditional",
      conditions,
      options: {
        defaultWorkflow: null,
        evaluateAll: false,
        ...options,
      },
      execute: async (context, compositionOptions = {}) => {
        return this.executeConditional(conditions, context, {
          ...options,
          ...compositionOptions,
        });
      },
    };

    this.compositions.set(name, composition);
    return composition;
  }

  /**
   * Create a retry composition wrapper
   * @param {string} name - Composition name
   * @param {string|Object} workflow - Workflow to wrap with retry logic
   * @param {Object} options - Retry options
   */
  createRetry(name, workflow, options = {}) {
    const composition = {
      name,
      type: "retry",
      workflow,
      options: {
        maxAttempts: 3,
        backoffStrategy: "exponential",
        baseDelay: 1000,
        maxDelay: 30000,
        retryCondition: (error) => error.retryable !== false,
        ...options,
      },
      execute: async (context, compositionOptions = {}) => {
        return this.executeWithRetry(workflow, context, {
          ...options,
          ...compositionOptions,
        });
      },
    };

    this.compositions.set(name, composition);
    return composition;
  }

  /**
   * Execute sequential workflow composition
   * @private
   */
  async executeSequential(workflows, context, options) {
    const results = [];
    let currentContext = { ...context };

    log.debug("Executing sequential composition", {
      workflowCount: workflows.length,
      options,
    });

    for (let i = 0; i < workflows.length; i++) {
      const workflow = workflows[i];

      try {
        const result = await this.executeWorkflow(
          workflow,
          currentContext,
          options
        );
        results.push(result);

        if (!result.success && options.failFast) {
          throw new Error(
            `Sequential composition failed at workflow ${i + 1}: ${
              result.error?.message
            }`
          );
        }

        // Pass data between workflows if enabled
        if (options.passDataBetween && result.success) {
          currentContext = { ...currentContext, ...result.data };
        }
      } catch (error) {
        if (options.failFast) {
          throw error;
        }
        results.push({
          success: false,
          error: { message: error.message },
          workflow: typeof workflow === "string" ? workflow : workflow.name,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const success = successCount === workflows.length;

    return {
      success,
      results,
      data: success ? currentContext : {},
      summary: {
        total: workflows.length,
        successful: successCount,
        failed: workflows.length - successCount,
      },
    };
  }

  /**
   * Execute parallel workflow composition
   * @private
   */
  async executeParallel(workflows, context, options) {
    log.debug("Executing parallel composition", {
      workflowCount: workflows.length,
      options,
    });

    const workflowPromises = workflows.map(async (workflow, index) => {
      try {
        const result = await this.executeWorkflow(workflow, context, options);
        return {
          ...result,
          index,
          workflow: typeof workflow === "string" ? workflow : workflow.name,
        };
      } catch (error) {
        return {
          success: false,
          error: { message: error.message },
          index,
          workflow: typeof workflow === "string" ? workflow : workflow.name,
        };
      }
    });

    const results = await Promise.allSettled(workflowPromises);
    const resolvedResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : {
            success: false,
            error: { message: r.reason.message },
            workflow: "unknown",
          }
    );

    const successCount = resolvedResults.filter((r) => r.success).length;
    const success = options.failFast
      ? successCount === workflows.length
      : successCount > 0;

    // Aggregate results if enabled
    let aggregatedData = {};
    if (options.aggregateResults) {
      resolvedResults
        .filter((r) => r.success)
        .forEach((r) => {
          aggregatedData = { ...aggregatedData, ...r.data };
        });
    }

    return {
      success,
      results: resolvedResults,
      data: aggregatedData,
      summary: {
        total: workflows.length,
        successful: successCount,
        failed: workflows.length - successCount,
      },
    };
  }

  /**
   * Execute conditional workflow composition
   * @private
   */
  async executeConditional(conditions, context, options) {
    log.debug("Executing conditional composition", {
      conditionCount: Object.keys(conditions).length,
      options,
    });

    const results = [];
    let executed = false;

    for (const [condition, workflow] of Object.entries(conditions)) {
      try {
        const shouldExecute = await this.evaluateCondition(condition, context);

        if (shouldExecute) {
          const result = await this.executeWorkflow(workflow, context, options);
          results.push({ condition, result });
          executed = true;

          if (!options.evaluateAll) {
            break;
          }
        }
      } catch (error) {
        results.push({
          condition,
          result: {
            success: false,
            error: { message: error.message },
          },
        });
      }
    }

    // Execute default workflow if no conditions matched
    if (!executed && options.defaultWorkflow) {
      try {
        const result = await this.executeWorkflow(
          options.defaultWorkflow,
          context,
          options
        );
        results.push({ condition: "default", result });
        executed = true;
      } catch (error) {
        results.push({
          condition: "default",
          result: {
            success: false,
            error: { message: error.message },
          },
        });
      }
    }

    const successCount = results.filter((r) => r.result.success).length;
    const aggregatedData = results
      .filter((r) => r.result.success)
      .reduce((acc, r) => ({ ...acc, ...r.result.data }), {});

    return {
      success: executed && successCount > 0,
      results,
      data: aggregatedData,
      executed,
      summary: {
        conditionsEvaluated: Object.keys(conditions).length,
        conditionsMatched: results.length,
        successful: successCount,
      },
    };
  }

  /**
   * Execute workflow with retry logic
   * @private
   */
  async executeWithRetry(workflow, context, options) {
    let lastError;
    let attempt = 0;

    log.debug("Executing workflow with retry", {
      workflow: typeof workflow === "string" ? workflow : workflow.name,
      maxAttempts: options.maxAttempts,
      backoffStrategy: options.backoffStrategy,
    });

    while (attempt < options.maxAttempts) {
      attempt++;

      try {
        const result = await this.executeWorkflow(workflow, context, options);

        if (result.success) {
          return {
            ...result,
            attempts: attempt,
            retried: attempt > 1,
          };
        }

        // Check if error is retryable
        if (!options.retryCondition(result.error)) {
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = { message: error.message };

        if (!options.retryCondition(lastError)) {
          throw error;
        }
      }

      // Apply backoff delay before retry
      if (attempt < options.maxAttempts) {
        const delay = this.calculateBackoffDelay(attempt, options);
        await new Promise((resolve) => setTimeout(resolve, delay));

        log.debug("Retrying workflow execution", {
          workflow: typeof workflow === "string" ? workflow : workflow.name,
          attempt: attempt + 1,
          delay,
        });
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: attempt,
      retried: true,
      exhaustedRetries: true,
    };
  }

  /**
   * Execute a single workflow (string name or definition)
   * @private
   */
  async executeWorkflow(workflow, context, options) {
    const { workflowRegistry } = await import("./WorkflowRegistry.js");

    if (typeof workflow === "string") {
      return workflowRegistry.execute(workflow, context, options);
    } else if (workflow && typeof workflow.execute === "function") {
      return workflow.execute(context, options);
    } else {
      throw new Error("Invalid workflow definition");
    }
  }

  /**
   * Evaluate condition for conditional execution
   * @private
   */
  async evaluateCondition(condition, context) {
    if (typeof condition === "function") {
      return await condition(context);
    } else if (typeof condition === "string") {
      // Simple property-based conditions
      const [property, operator, value] = condition.split(" ");
      const actualValue = this.getNestedProperty(context, property);

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
  }

  /**
   * Calculate backoff delay for retry attempts
   * @private
   */
  calculateBackoffDelay(attempt, options) {
    let delay;

    switch (options.backoffStrategy) {
      case "linear":
        delay = options.baseDelay * attempt;
        break;
      case "exponential":
        delay = options.baseDelay * Math.pow(2, attempt - 1);
        break;
      case "fixed":
      default:
        delay = options.baseDelay;
        break;
    }

    return Math.min(delay, options.maxDelay);
  }

  /**
   * Get nested property from object
   * @private
   */
  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get composition by name
   * @param {string} name - Composition name
   */
  getComposition(name) {
    return this.compositions.get(name);
  }

  /**
   * List all compositions
   */
  listCompositions() {
    return Array.from(this.compositions.values());
  }

  /**
   * Remove composition
   * @param {string} name - Composition name
   */
  removeComposition(name) {
    return this.compositions.delete(name);
  }
}

// Export singleton instance
export const workflowComposer = new WorkflowComposer();
export default workflowComposer;
