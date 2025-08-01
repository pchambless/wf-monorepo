/**
 * SelectVals Configuration Helper
 * Utility for accessing configuration data from selectVals.json
 */

import selectVals from "./selectVals.json";

/**
 * Get configuration choices by key
 * @param {string} configKey - Configuration key (e.g., 'planStatus', 'priority', 'cluster')
 * @param {Object} options - Options for data processing
 * @param {boolean} options.sortByOrder - Sort by 'ordr' field (default: true)
 * @param {boolean} options.includeMetadata - Include metadata like name, description (default: false)
 * @returns {Array|Object} Configuration choices or full config object
 */
export function getConfigChoices(configKey, options = {}) {
  const { sortByOrder = true, includeMetadata = false } = options;

  try {
    const config = selectVals[configKey];

    if (!config) {
      console.warn(
        `Configuration key '${configKey}' not found in selectVals.json`
      );
      return [];
    }

    if (!config.choices || !Array.isArray(config.choices)) {
      console.warn(
        `Configuration '${configKey}' does not have valid choices array`
      );
      return includeMetadata ? config : [];
    }

    let choices = [...config.choices];

    // Sort by order if requested and ordr field exists
    if (sortByOrder && choices.length > 0 && choices[0].ordr !== undefined) {
      choices.sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
    }

    // Return full config object with metadata if requested
    if (includeMetadata) {
      return {
        ...config,
        choices,
      };
    }

    return choices;
  } catch (error) {
    console.error(
      `Error accessing selectVals configuration '${configKey}':`,
      error
    );
    return [];
  }
}

/**
 * Get a specific choice by value
 * @param {string} configKey - Configuration key
 * @param {string} value - Choice value to find
 * @returns {Object|null} Choice object or null if not found
 */
export function getConfigChoice(configKey, value) {
  const choices = getConfigChoices(configKey, { sortByOrder: false });
  return choices.find((choice) => choice.value === value) || null;
}

/**
 * Get configuration metadata (name, description, etc.)
 * @param {string} configKey - Configuration key
 * @returns {Object} Configuration metadata
 */
export function getConfigMetadata(configKey) {
  try {
    const config = selectVals[configKey];
    if (!config) {
      return null;
    }

    const { choices, ...metadata } = config;
    return metadata;
  } catch (error) {
    console.error(
      `Error accessing selectVals metadata for '${configKey}':`,
      error
    );
    return null;
  }
}

/**
 * Get all available configuration keys
 * @returns {Array} Array of configuration keys
 */
export function getAvailableConfigs() {
  return Object.keys(selectVals);
}

/**
 * Validate if a configuration key exists
 * @param {string} configKey - Configuration key to validate
 * @returns {boolean} True if configuration exists
 */
export function hasConfig(configKey) {
  return selectVals.hasOwnProperty(configKey);
}

/**
 * Get choices formatted for dropdown/select components
 * @param {string} configKey - Configuration key
 * @param {Object} options - Formatting options
 * @param {string} options.labelField - Field to use as label (default: 'label')
 * @param {string} options.valueField - Field to use as value (default: 'value')
 * @param {boolean} options.includeColors - Include color information (default: true)
 * @returns {Array} Formatted choices for UI components
 */
export function getFormattedChoices(configKey, options = {}) {
  const {
    labelField = "label",
    valueField = "value",
    includeColors = true,
  } = options;

  const choices = getConfigChoices(configKey);

  return choices.map((choice) => {
    const formatted = {
      label: choice[labelField] || choice.label || choice.value,
      value: choice[valueField] || choice.value,
    };

    if (includeColors && choice.color) {
      formatted.color = choice.color;
    }

    // Include any additional fields
    Object.keys(choice).forEach((key) => {
      if (!["label", "value", "color"].includes(key)) {
        formatted[key] = choice[key];
      }
    });

    return formatted;
  });
}

/**
 * CommonConfigs - Simplified parameterized function for accessing any configuration
 * @param {string} configKey - Configuration key (e.g., 'planStatus', 'priority', 'cluster')
 * @param {Object} options - Options for data processing
 * @param {boolean} options.sortByOrder - Sort by 'ordr' field (default: true)
 * @param {boolean} options.includeMetadata - Include metadata like name, description (default: false)
 * @returns {Array|Object} Configuration choices or full config object
 *
 * @example
 * // Simple usage
 * const statuses = CommonConfigs('planStatus');
 * const priorities = CommonConfigs('priority');
 *
 * // With options
 * const clusters = CommonConfigs('cluster', { includeMetadata: true });
 * const workflows = CommonConfigs('registeredWorkflows', { sortByOrder: false });
 */
export const CommonConfigs = (configKey, options = {}) => {
  return getConfigChoices(configKey, { sortByOrder: true, ...options });
};

/**
 * Legacy object-based API (maintained for backward compatibility)
 * @deprecated Use CommonConfigs(configKey) instead
 */
CommonConfigs.legacy = {
  /**
   * @deprecated Use CommonConfigs('planStatus') instead
   */
  getPlanStatuses: (options = {}) => getConfigChoices("planStatus", options),

  /**
   * @deprecated Use CommonConfigs('priority') instead
   */
  getPriorities: (options = {}) => getConfigChoices("priority", options),

  /**
   * @deprecated Use CommonConfigs('cluster') instead
   */
  getClusters: (options = {}) => getConfigChoices("cluster", options),

  /**
   * @deprecated Use CommonConfigs('complexity') instead
   */
  getComplexities: (options = {}) => getConfigChoices("complexity", options),

  /**
   * @deprecated Use CommonConfigs('workflowTimeouts') instead
   */
  getWorkflowTimeouts: (options = {}) =>
    getConfigChoices("workflowTimeouts", options),

  /**
   * @deprecated Use CommonConfigs('workflowRetryPolicies') instead
   */
  getWorkflowRetryPolicies: (options = {}) =>
    getConfigChoices("workflowRetryPolicies", options),

  /**
   * @deprecated Use CommonConfigs('registeredWorkflows') instead
   */
  getRegisteredWorkflows: (options = {}) =>
    getConfigChoices("registeredWorkflows", options),
};

// Default export
export default {
  getConfigChoices,
  getConfigChoice,
  getConfigMetadata,
  getAvailableConfigs,
  hasConfig,
  getFormattedChoices,
  CommonConfigs,
};
