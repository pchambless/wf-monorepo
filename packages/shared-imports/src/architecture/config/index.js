/**
 * Architecture Configuration Loader
 * Centralized access to all select widget configurations
 */

// Import JSON configuration files
import clustersConfig from "./clusters.json";
import prioritiesConfig from "./priorities.json";
import complexitiesConfig from "./complexities.json";
import communicationTypesConfig from "./communication-types.json";

// Import the new selectVals helper utility
export {
  getConfigChoices,
  getConfigChoice,
  getConfigMetadata,
  getAvailableConfigs,
  hasConfig,
  getFormattedChoices,
  CommonConfigs,
} from "./selectValsHelper.js";

/**
 * Get cluster options for dropdowns
 */
export const getClusterOptions = () => {
  return Object.entries(clustersConfig).map(([key, cluster]) => ({
    value: key,
    label: cluster.name,
    description: cluster.description,
    blastRadius: cluster.blastRadius,
  }));
};

/**
 * Get priority options for dropdowns
 */
export const getPriorityOptions = () => {
  return prioritiesConfig;
};

/**
 * Get complexity options for dropdowns
 */
export const getComplexityOptions = () => {
  return complexitiesConfig;
};

/**
 * Get communication type options for dropdowns
 */
export const getCommunicationTypeOptions = () => {
  return communicationTypesConfig;
};

/**
 * Get completion status options
 */
export const getCompletionStatusOptions = () => {
  return [
    { value: "completed", label: "Completed - Successfully finished" },
    { value: "cancelled", label: "Cancelled - No longer needed" },
    { value: "on-hold", label: "On Hold - Temporarily paused" },
    { value: "archived", label: "Archived - Moved to archive" },
  ];
};

// Export all configs for direct access if needed
export {
  clustersConfig,
  prioritiesConfig,
  complexitiesConfig,
  communicationTypesConfig,
};
