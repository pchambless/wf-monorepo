/**
 * EventType Parser - Phase 2
 * Parses and validates eventType workflow configurations
 */

// Import the plan eventTypes at the top level
import { PLAN_EVENTS } from "../../../events/plans/eventTypes.js";
import { CommonConfigs } from "../../config/selectValsHelper.js";

/**
 * Parse workflow configuration from eventType definition
 * @param {Object} eventDefinition - EventType definition with workflows
 * @returns {Object} Parsed workflow configuration
 */
export function parseWorkflowConfig(eventDefinition) {
  const {
    workflows = [],
    workflowTriggers = {},
    workflowConfig = {},
  } = eventDefinition;

  return {
    workflows,
    triggers: workflowTriggers,
    config: {
      errorHandling: workflowConfig.errorHandling || "fail-fast",
      retryPolicy: workflowConfig.retryPolicy || "standard",
      timeout: workflowConfig.timeout || 30000,
      contextRefresh: workflowConfig.contextRefresh || [],
    },
  };
}

/**
 * Get workflows for specific trigger
 * @param {string} eventType - EventType name
 * @param {string} trigger - Trigger name (onLoad, onSelect, etc.)
 * @returns {Array} Workflow names for trigger
 */
export function getTriggersForEvent(eventType, trigger) {
  const eventDefinition = getEventDefinition(eventType);
  return eventDefinition?.workflowTriggers?.[trigger] || [];
}

/**
 * Get event definition from eventTypes configuration
 * @param {string} eventType - EventType name
 * @returns {Object} Event definition
 */
export function getEventDefinition(eventType) {
  return PLAN_EVENTS.find((event) => event.eventType === eventType);
}

/**
 * Validate workflow references exist in registry
 * @param {Object} eventDefinition - EventType definition
 * @returns {Object} Validation result
 */
export function validateWorkflowReferences(eventDefinition) {
  const { workflows = [] } = eventDefinition;

  const errors = [];
  const warnings = [];

  // Phase 2: Basic validation - will enhance in Phase 3
  workflows.forEach((workflowName) => {
    if (!workflowName || typeof workflowName !== "string") {
      errors.push(`Invalid workflow name: ${workflowName}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get SQL query from eventType
 * @param {string} eventType - EventType name
 * @returns {Object} Query information
 */
export function getEventQuery(eventType) {
  const eventDefinition = getEventDefinition(eventType);

  if (!eventDefinition) {
    return null;
  }

  return {
    sql: eventDefinition.qrySQL,
    params: eventDefinition.params || [],
    table: eventDefinition.dbTable,
    method: eventDefinition.method || "GET",
    primaryKey: eventDefinition.primaryKey || "id",
  };
}

/**
 * Get configuration data from CONFIG eventType
 * @param {string} eventType - EventType name
 * @returns {Array|null} Configuration choices or null
 */
export function getConfigData(eventType) {
  const eventDefinition = getEventDefinition(eventType);

  if (!eventDefinition || eventDefinition.method !== "CONFIG") {
    return null;
  }

  if (!eventDefinition.configKey) {
    console.warn(`CONFIG eventType '${eventType}' missing configKey`);
    return null;
  }

  try {
    return CommonConfigs(
      eventDefinition.configKey,
      eventDefinition.configOptions || {}
    );
  } catch (error) {
    console.error(`Error loading config data for '${eventType}':`, error);
    return null;
  }
}

export default {
  parseWorkflowConfig,
  getTriggersForEvent,
  getEventDefinition,
  validateWorkflowReferences,
  getEventQuery,
  getConfigData,
};
