/**
 * Workflow Configuration Loader
 *
 * Centralized access to workflow-related configurations from selectVals.json
 * Following config-driven development standards
 */

// Load selectVals data from JavaScript export (most compatible)
import selectVals from "./selectValsData.js";

/**
 * Get workflow timeout for a specific workflow
 * @param {string} workflowName - Name of the workflow
 * @returns {number} Timeout in milliseconds
 */
export function getWorkflowTimeout(workflowName) {
  const timeoutConfig = selectVals.workflowTimeouts?.choices?.find(
    (choice) => choice.value === workflowName
  );
  return timeoutConfig?.timeout || 30000; // Default 30 seconds
}

/**
 * Get all workflow timeout configurations
 * @returns {Array} Array of timeout configurations
 */
export function getWorkflowTimeouts() {
  return selectVals.workflowTimeouts?.choices || [];
}

/**
 * Get retry policy configuration
 * @param {string} policyType - Type of retry policy
 * @returns {Object} Retry policy configuration
 */
export function getRetryPolicy(policyType = "standard") {
  const policy = selectVals.workflowRetryPolicies?.choices?.find(
    (choice) => choice.value === policyType
  );
  return (
    policy || {
      value: "standard",
      maxAttempts: 3,
      backoffMs: 1000,
      backoffMultiplier: 2,
    }
  );
}

/**
 * Get all retry policy options
 * @returns {Array} Array of retry policy options
 */
export function getRetryPolicyOptions() {
  return selectVals.workflowRetryPolicies?.choices || [];
}

/**
 * Get error handling strategy options
 * @returns {Array} Array of error handling strategies
 */
export function getErrorHandlingOptions() {
  return selectVals.workflowErrorHandling?.choices || [];
}

/**
 * Get error handling strategy configuration
 * @param {string} strategy - Error handling strategy
 * @returns {Object} Error handling configuration
 */
export function getErrorHandlingStrategy(strategy = "fail-fast") {
  return (
    selectVals.workflowErrorHandling?.choices?.find(
      (choice) => choice.value === strategy
    ) || { value: "fail-fast", description: "Stop on first error" }
  );
}

/**
 * Get communication pattern options
 * @returns {Array} Array of communication patterns
 */
export function getCommunicationPatternOptions() {
  return selectVals.workflowCommunicationPatterns?.choices || [];
}

/**
 * Get communication pattern configuration
 * @param {string} pattern - Communication pattern
 * @returns {Object} Communication pattern configuration
 */
export function getCommunicationPattern(pattern = "sequential") {
  return (
    selectVals.workflowCommunicationPatterns?.choices?.find(
      (choice) => choice.value === pattern
    ) || { value: "sequential", description: "Execute steps in sequence" }
  );
}

/**
 * Get data passing strategy options
 * @returns {Array} Array of data passing strategies
 */
export function getDataPassingStrategyOptions() {
  return selectVals.workflowDataPassingStrategies?.choices || [];
}

/**
 * Get data passing strategy configuration
 * @param {string} strategy - Data passing strategy
 * @returns {Object} Data passing strategy configuration
 */
export function getDataPassingStrategy(strategy = "merge") {
  return (
    selectVals.workflowDataPassingStrategies?.choices?.find(
      (choice) => choice.value === strategy
    ) || { value: "merge", description: "Merge workflow results together" }
  );
}

/**
 * Get workflow agent options
 * @returns {Array} Array of workflow agents
 */
export function getWorkflowAgentOptions() {
  return selectVals.workflowAgents?.choices || [];
}

/**
 * Get workflow agent configuration
 * @param {string} agent - Agent name
 * @returns {Object} Agent configuration
 */
export function getWorkflowAgent(agent = "claude") {
  return (
    selectVals.workflowAgents?.choices?.find(
      (choice) => choice.value === agent
    ) || {
      value: "claude",
      label: "Claude",
      description: "Claude AI assistant",
    }
  );
}

/**
 * Get workflow phase options
 * @returns {Array} Array of workflow phases
 */
export function getWorkflowPhaseOptions() {
  return selectVals.workflowPhases?.choices || [];
}

/**
 * Get workflow phase configuration
 * @param {string} phase - Phase name
 * @returns {Object} Phase configuration
 */
export function getWorkflowPhase(phase = "idea") {
  return (
    selectVals.workflowPhases?.choices?.find(
      (choice) => choice.value === phase
    ) || { value: "idea", label: "Idea", description: "Initial concept phase" }
  );
}

/**
 * Get workflow impact type options
 * @returns {Array} Array of impact types
 */
export function getWorkflowImpactTypeOptions() {
  return selectVals.workflowImpactTypes?.choices || [];
}

/**
 * Get workflow impact type configuration
 * @param {string} impactType - Impact type
 * @returns {Object} Impact type configuration
 */
export function getWorkflowImpactType(impactType = "MODIFY") {
  return (
    selectVals.workflowImpactTypes?.choices?.find(
      (choice) => choice.value === impactType
    ) || {
      value: "MODIFY",
      label: "Modify",
      description: "Modifying existing files or resources",
    }
  );
}

/**
 * Get default workflow configuration
 * @param {string} workflowType - Type of workflow
 * @returns {Object} Default workflow configuration
 */
export function getDefaultWorkflowConfig(workflowType) {
  return {
    timeout: getWorkflowTimeout(workflowType),
    retryPolicy: getRetryPolicy("standard"),
    errorHandling: getErrorHandlingStrategy("fail-fast"),
    communicationPattern: getCommunicationPattern("sequential"),
    dataPassingStrategy: getDataPassingStrategy("merge"),
    agent: getWorkflowAgent("claude"),
    phase: getWorkflowPhase("idea"),
  };
}

/**
 * Get workflow configuration for component integration
 * @param {string} componentType - Type of component (form, editor, etc.)
 * @returns {Object} Component-specific workflow configuration
 */
export function getComponentWorkflowConfig(componentType) {
  const baseConfig = getDefaultWorkflowConfig();

  switch (componentType) {
    case "form":
      return {
        ...baseConfig,
        timeout: 15000,
        retryPolicy: getRetryPolicy("standard"),
        errorHandling: getErrorHandlingStrategy("fail-fast"),
      };
    case "editor":
      return {
        ...baseConfig,
        timeout: 10000,
        retryPolicy: getRetryPolicy("conservative"),
        errorHandling: getErrorHandlingStrategy("continue"),
      };
    case "modal":
      return {
        ...baseConfig,
        timeout: 8000,
        retryPolicy: getRetryPolicy("none"),
        errorHandling: getErrorHandlingStrategy("fail-fast"),
      };
    default:
      return baseConfig;
  }
}

/**
 * Validate workflow configuration
 * @param {Object} config - Workflow configuration to validate
 * @returns {Object} Validation result with errors if any
 */
export function validateWorkflowConfig(config) {
  const errors = [];

  if (!config) {
    errors.push("Configuration is required");
    return { valid: false, errors };
  }

  if (
    config.timeout &&
    (typeof config.timeout !== "number" || config.timeout <= 0)
  ) {
    errors.push("Timeout must be a positive number");
  }

  if (config.retryPolicy && !config.retryPolicy.maxAttempts) {
    errors.push("Retry policy must have maxAttempts");
  }

  if (config.errorHandling && !config.errorHandling.value) {
    errors.push("Error handling strategy must have a value");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get registered workflow documentation
 * @param {string} workflowName - Optional workflow name to filter by
 * @returns {Array|Object} Workflow documentation
 */
export function getRegisteredWorkflows(workflowName = null) {
  const workflows = selectVals.registeredWorkflows?.choices || [];

  if (workflowName) {
    return (
      workflows.find((workflow) => workflow.value === workflowName) || null
    );
  }

  return workflows;
}

/**
 * Get workflows by category
 * @param {string} category - Workflow category
 * @returns {Array} Workflows in the specified category
 */
export function getWorkflowsByCategory(category) {
  const workflows = selectVals.registeredWorkflows?.choices || [];
  return workflows.filter((workflow) => workflow.category === category);
}

/**
 * Get workflow categories
 * @returns {Array} Available workflow categories
 */
export function getWorkflowCategories() {
  return selectVals.workflowCategories?.choices || [];
}

/**
 * Get workflow documentation for a specific workflow
 * @param {string} workflowName - Workflow name
 * @returns {Object} Workflow documentation including steps, timeout, etc.
 */
export function getWorkflowDocumentation(workflowName) {
  const workflow = getRegisteredWorkflows(workflowName);
  if (!workflow) {
    return null;
  }

  return {
    name: workflow.value,
    label: workflow.label,
    description: workflow.description,
    category: workflow.category,
    timeout: workflow.timeout,
    steps: workflow.steps || [],
    contextRefresh: workflow.contextRefresh || [],
    errorHandling: workflow.errorHandling || "fail-fast",
    retryable: workflow.retryable !== false,
  };
}

/**
 * Validate that a workflow is properly documented in config
 * @param {string} workflowName - Workflow name to validate
 * @returns {Object} Validation result
 */
export function validateWorkflowDocumentation(workflowName) {
  const workflow = getRegisteredWorkflows(workflowName);

  if (!workflow) {
    return {
      valid: false,
      errors: [
        `Workflow '${workflowName}' is not documented in selectVals.json`,
      ],
      warnings: [],
    };
  }

  const errors = [];
  const warnings = [];

  // Check required fields
  if (!workflow.description) {
    errors.push("Workflow description is required");
  }

  if (!workflow.category) {
    warnings.push("Workflow category is recommended");
  }

  if (!workflow.timeout) {
    warnings.push("Workflow timeout should be specified");
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    warnings.push("Workflow steps should be documented");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Export all configuration getters as a single object for convenience
export const WorkflowConfig = {
  getWorkflowTimeout,
  getWorkflowTimeouts,
  getRetryPolicy,
  getRetryPolicyOptions,
  getErrorHandlingOptions,
  getErrorHandlingStrategy,
  getCommunicationPatternOptions,
  getCommunicationPattern,
  getDataPassingStrategyOptions,
  getDataPassingStrategy,
  getWorkflowAgentOptions,
  getWorkflowAgent,
  getWorkflowPhaseOptions,
  getWorkflowPhase,
  getWorkflowImpactTypeOptions,
  getWorkflowImpactType,
  getDefaultWorkflowConfig,
  getComponentWorkflowConfig,
  validateWorkflowConfig,
  getRegisteredWorkflows,
  getWorkflowsByCategory,
  getWorkflowCategories,
  getWorkflowDocumentation,
  validateWorkflowDocumentation,
};

export default WorkflowConfig;
