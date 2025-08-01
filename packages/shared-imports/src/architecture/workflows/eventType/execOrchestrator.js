/**
 * execOrchestrator - Phase 3: Workflow Execution
 * Orchestrates workflow execution following the established exec* naming pattern
 * Handles sequential, parallel, and conditional workflow execution
 */

const codeName = `[execOrchestrator.js]`;
const logger = console;

/**
 * Execute workflows sequentially (one after another)
 * @param {Array} workflows - Array of workflow names to execute
 * @param {Object} context - Execution context data
 * @returns {Promise<Object>} Execution result
 */
export async function executeSequential(workflows, context = {}) {
  logger.debug(`${codeName} Executing sequential workflows:`, {
    workflows,
    context,
  });

  const results = [];
  let aggregatedContext = { ...context };

  try {
    for (const workflowName of workflows) {
      logger.debug(`${codeName} Executing workflow: ${workflowName}`);

      // Placeholder for actual workflow execution
      const result = await executeWorkflow(workflowName, aggregatedContext);
      results.push(result);

      // Merge result data into context for next workflow
      if (result.success && result.data) {
        aggregatedContext = { ...aggregatedContext, ...result.data };
      }
    }

    logger.info(`${codeName} Sequential execution completed successfully`);
    return {
      success: true,
      results,
      context: aggregatedContext,
      executionType: "sequential",
    };
  } catch (error) {
    logger.error(`${codeName} Sequential execution failed:`, error);
    return {
      success: false,
      error: error.message,
      results,
      executionType: "sequential",
    };
  }
}

/**
 * Execute workflows in parallel (simultaneously)
 * @param {Array} workflows - Array of workflow names to execute
 * @param {Object} context - Execution context data
 * @returns {Promise<Object>} Execution result
 */
export async function executeParallel(workflows, context = {}) {
  logger.debug(`${codeName} Executing parallel workflows:`, {
    workflows,
    context,
  });

  try {
    // Execute all workflows simultaneously
    const promises = workflows.map((workflowName) =>
      executeWorkflow(workflowName, context)
    );

    const results = await Promise.allSettled(promises);

    // Process results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    );
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value.success
    );

    logger.info(
      `${codeName} Parallel execution completed: ${successful.length} successful, ${failed.length} failed`
    );

    return {
      success: failed.length === 0,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
      ),
      successful: successful.length,
      failed: failed.length,
      executionType: "parallel",
    };
  } catch (error) {
    logger.error(`${codeName} Parallel execution failed:`, error);
    return {
      success: false,
      error: error.message,
      executionType: "parallel",
    };
  }
}

/**
 * Execute workflows conditionally based on context
 * @param {Object} conditionalConfig - Configuration for conditional execution
 * @param {Object} context - Execution context data
 * @returns {Promise<Object>} Execution result
 */
export async function executeConditional(conditionalConfig, context = {}) {
  logger.debug(`${codeName} Executing conditional workflows:`, {
    conditionalConfig,
    context,
  });

  try {
    const { conditions, workflows } = conditionalConfig;
    const workflowsToExecute = [];

    // Evaluate conditions to determine which workflows to run
    for (const condition of conditions) {
      if (evaluateCondition(condition, context)) {
        workflowsToExecute.push(...condition.workflows);
      }
    }

    if (workflowsToExecute.length === 0) {
      logger.info(`${codeName} No workflows matched conditions`);
      return {
        success: true,
        results: [],
        executionType: "conditional",
        message: "No workflows matched conditions",
      };
    }

    // Execute the matched workflows sequentially by default
    return await executeSequential(workflowsToExecute, context);
  } catch (error) {
    logger.error(`${codeName} Conditional execution failed:`, error);
    return {
      success: false,
      error: error.message,
      executionType: "conditional",
    };
  }
}

/**
 * Execute a single workflow (placeholder for Phase 3)
 * @param {string} workflowName - Name of workflow to execute
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Workflow result
 */
async function executeWorkflow(workflowName, context) {
  logger.debug(`${codeName} Executing single workflow: ${workflowName}`);

  // Phase 3: Placeholder implementation
  // In full implementation, this would:
  // 1. Look up workflow definition
  // 2. Execute workflow steps
  // 3. Handle errors and retries
  // 4. Return structured result

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        workflowName,
        data: { [`${workflowName}Result`]: "completed" },
        executionTime: Date.now(),
        message: `Phase 3: ${workflowName} executed successfully`,
      });
    }, 100); // Simulate async execution
  });
}

/**
 * Evaluate a condition against context
 * @param {Object} condition - Condition to evaluate
 * @param {Object} context - Context data
 * @returns {boolean} Whether condition is met
 */
function evaluateCondition(condition, context) {
  const { field, operator, value } = condition;
  const contextValue = context[field];

  switch (operator) {
    case "equals":
      return contextValue === value;
    case "notEquals":
      return contextValue !== value;
    case "exists":
      return contextValue !== undefined && contextValue !== null;
    case "notExists":
      return contextValue === undefined || contextValue === null;
    default:
      logger.warn(`${codeName} Unknown condition operator: ${operator}`);
      return false;
  }
}

/**
 * Main orchestrator function - determines execution type and delegates
 * @param {string} executionType - Type of execution (sequential, parallel, conditional)
 * @param {Array|Object} config - Workflows or configuration
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Execution result
 */
export async function execOrchestrator(executionType, config, context = {}) {
  logger.info(`${codeName} Starting ${executionType} execution`);

  switch (executionType) {
    case "sequential":
      return await executeSequential(config, context);
    case "parallel":
      return await executeParallel(config, context);
    case "conditional":
      return await executeConditional(config, context);
    default:
      logger.error(`${codeName} Unknown execution type: ${executionType}`);
      return {
        success: false,
        error: `Unknown execution type: ${executionType}`,
      };
  }
}

export default {
  executeSequential,
  executeParallel,
  executeConditional,
  execOrchestrator,
};
