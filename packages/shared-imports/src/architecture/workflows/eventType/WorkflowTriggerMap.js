/**
 * Workflow Trigger Map - Phase 2
 * Maps UI events to workflow executions
 */

import { getTriggersForEvent } from "./EventTypeParser.js";

/**
 * Map trigger to workflows for execution
 * @param {string} eventType - EventType name
 * @param {string} trigger - Trigger name
 * @returns {Array} Workflows to execute
 */
export function mapTriggerToWorkflows(eventType, trigger) {
  return getTriggersForEvent(eventType, trigger);
}

/**
 * Validate trigger configuration
 * @param {Object} triggers - Trigger configuration
 * @returns {Object} Validation result
 */
export function validateTriggerConfiguration(triggers) {
  const validTriggers = [
    "onLoad",
    "onSelect",
    "onUpdate",
    "onCreate",
    "onDelete",
    "onError",
  ];
  const errors = [];

  Object.keys(triggers).forEach((trigger) => {
    if (!validTriggers.includes(trigger)) {
      errors.push(
        `Invalid trigger '${trigger}'. Valid triggers: ${validTriggers.join(
          ", "
        )}`
      );
    }

    if (!Array.isArray(triggers[trigger])) {
      errors.push(`Trigger '${trigger}' must be an array of workflow names`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Resolve trigger context with event data
 * @param {string} trigger - Trigger name
 * @param {Object} eventContext - Event context data
 * @returns {Object} Resolved context for workflow execution
 */
export function resolveTriggerContext(trigger, eventContext) {
  return {
    trigger,
    timestamp: new Date().toISOString(),
    ...eventContext,
    // Add trigger-specific context resolution
    metadata: {
      triggerType: trigger,
      source: "eventType-integration",
      ...eventContext.metadata,
    },
  };
}

/**
 * Phase 2: Placeholder for execWorkflow - will be implemented in Phase 3
 * @param {string} eventType - EventType name
 * @param {string} trigger - Trigger name
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Placeholder result
 */
export async function execWorkflow(eventType, trigger, context = {}) {
  console.log(
    `Phase 2: execWorkflow placeholder - ${eventType}.${trigger}`,
    context
  );

  // Phase 2: Return success without actual execution
  return {
    success: true,
    message: `Phase 2: Workflow ${eventType}.${trigger} would execute here`,
    eventType,
    trigger,
    context,
    phase: 2,
  };
}

export default {
  mapTriggerToWorkflows,
  validateTriggerConfiguration,
  resolveTriggerContext,
  execWorkflow,
};
