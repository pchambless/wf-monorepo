/**
 * EventType Workflow System - Phase 3
 * Complete workflow execution system with orchestration and context management
 */

import { execOrchestrator } from "./execOrchestrator.js";
import {
  refreshContexts,
  propagateContextUpdates,
  getContextRefreshConfig,
} from "./ContextRefreshManager.js";
import {
  getEventDefinition,
  parseWorkflowConfig,
  getTriggersForEvent,
} from "./EventTypeParser.js";
const codeName = `[EventTypeWorkflowExecutor]`;
const logger = console;

/**
 * EventTypeWorkflowExecutor - Main class for executing eventType workflows
 */
export class EventTypeWorkflowExecutor {
  constructor(options = {}) {
    this.options = {
      errorHandling: "fail-fast",
      retryPolicy: "standard",
      timeout: 30000,
      contextRefresh: true,
      ...options,
    };

    logger.debug(`${codeName} Initialized with options:`, this.options);
  }

  /**
   * Execute workflows for an eventType trigger
   * @param {string} eventType - EventType name
   * @param {string} trigger - Trigger name (onSelect, onUpdate, etc.)
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflows(eventType, trigger, context = {}) {
    logger.info(`${codeName} Executing workflows for ${eventType}.${trigger}`);

    try {
      // Get event definition and workflow configuration
      const eventDefinition = getEventDefinition(eventType);
      if (!eventDefinition) {
        throw new Error(`EventType '${eventType}' not found`);
      }

      const workflowConfig = parseWorkflowConfig(eventDefinition);
      const workflows = getTriggersForEvent(eventType, trigger);

      if (!workflows || workflows.length === 0) {
        logger.info(
          `${codeName} No workflows found for ${eventType}.${trigger}`
        );
        return {
          success: true,
          message: `No workflows configured for ${eventType}.${trigger}`,
          eventType,
          trigger,
          workflows: [],
        };
      }

      logger.debug(`${codeName} Found workflows:`, workflows);

      // Execute workflows using orchestrator
      const executionResult = await execOrchestrator("sequential", workflows, {
        ...context,
        eventType,
        trigger,
        timestamp: new Date().toISOString(),
      });

      // Handle context refresh if enabled
      let contextRefreshResult = null;
      if (this.options.contextRefresh) {
        contextRefreshResult = await this.handleContextRefresh(
          eventType,
          context
        );
      }

      const result = {
        success: executionResult.success,
        eventType,
        trigger,
        workflows,
        executionResult,
        contextRefreshResult,
        executedAt: new Date().toISOString(),
      };

      logger.info(`${codeName} Workflow execution completed:`, {
        success: result.success,
        eventType,
        trigger,
        workflowCount: workflows.length,
      });

      return result;
    } catch (error) {
      logger.error(`${codeName} Workflow execution failed:`, error);
      return {
        success: false,
        error: error.message,
        eventType,
        trigger,
        executedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Handle context refresh after workflow execution
   * @param {string} eventType - EventType name
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Context refresh result
   */
  async handleContextRefresh(eventType, context) {
    try {
      const contextTypes = getContextRefreshConfig(eventType);

      if (contextTypes.length === 0) {
        return { success: true, message: "No context refresh required" };
      }

      logger.debug(`${codeName} Refreshing contexts:`, contextTypes);
      return await refreshContexts(contextTypes, context);
    } catch (error) {
      logger.error(`${codeName} Context refresh failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute error workflows when main workflows fail
   * @param {string} eventType - EventType name
   * @param {Object} error - Error information
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Error workflow result
   */
  async executeErrorWorkflows(eventType, error, context = {}) {
    logger.info(`${codeName} Executing error workflows for ${eventType}`);

    try {
      const errorWorkflows = getTriggersForEvent(eventType, "onError");

      if (!errorWorkflows || errorWorkflows.length === 0) {
        return { success: true, message: "No error workflows configured" };
      }

      return await execOrchestrator("sequential", errorWorkflows, {
        ...context,
        error,
        eventType,
        trigger: "onError",
        timestamp: new Date().toISOString(),
      });
    } catch (errorWorkflowError) {
      logger.error(
        `${codeName} Error workflow execution failed:`,
        errorWorkflowError
      );
      return {
        success: false,
        error: errorWorkflowError.message,
        originalError: error,
      };
    }
  }

  /**
   * Validate workflow configuration
   * @param {string} eventType - EventType name
   * @returns {Object} Validation result
   */
  validateWorkflows(eventType) {
    try {
      const eventDefinition = getEventDefinition(eventType);
      if (!eventDefinition) {
        return { valid: false, errors: [`EventType '${eventType}' not found`] };
      }

      const workflowConfig = parseWorkflowConfig(eventDefinition);
      const errors = [];
      const warnings = [];

      // Validate workflow triggers exist
      const triggers = workflowConfig.triggers || {};
      if (Object.keys(triggers).length === 0) {
        warnings.push("No workflow triggers configured");
      }

      // Validate workflow names
      for (const [trigger, workflows] of Object.entries(triggers)) {
        if (!Array.isArray(workflows)) {
          errors.push(`Trigger '${trigger}' workflows must be an array`);
          continue;
        }

        for (const workflow of workflows) {
          if (!workflow || typeof workflow !== "string") {
            errors.push(
              `Invalid workflow name in trigger '${trigger}': ${workflow}`
            );
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        eventType,
        workflowConfig,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation failed: ${error.message}`],
        eventType,
      };
    }
  }
}

// Create default instance
const defaultExecutor = new EventTypeWorkflowExecutor();

/**
 * Main execution function - uses default executor instance
 * @param {string} eventType - EventType name
 * @param {string} trigger - Trigger name
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Execution result
 */
export async function executeWorkflows(eventType, trigger, context = {}) {
  return await defaultExecutor.executeWorkflows(eventType, trigger, context);
}

// Export the main execWorkflow function following the execEvent/execDML pattern
export { execWorkflow } from "./WorkflowTriggerMap.js";

// Export utility functions
export {
  parseWorkflowConfig,
  getEventDefinition,
  getTriggersForEvent,
  getConfigData,
} from "./EventTypeParser.js";

export {
  mapTriggerToWorkflows,
  validateTriggerConfiguration,
  resolveTriggerContext,
} from "./WorkflowTriggerMap.js";

// Export orchestration functions
export { execOrchestrator } from "./execOrchestrator.js";
export {
  refreshContexts,
  propagateContextUpdates,
} from "./ContextRefreshManager.js";

// Export default
export default {
  EventTypeWorkflowExecutor,
  executeWorkflows,
  execOrchestrator,
  refreshContexts,
};
