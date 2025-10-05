/**
 * Automatic Impact Tracking System
 *
 * Main exports for the automatic impact tracking system
 * Part of automatic-impact-tracking spec
 */

import ImpactTracker from "./ImpactTracker.server.js";
import PlanResolver from "./PlanResolver.server.js";
import ImpactGenerator from "./ImpactGenerator.server.js";
import DatabaseWriter from "./DatabaseWriter.js";
import {
  configManager,
  ConfigManager,
  ImpactTrackingConfig,
} from "./config.js";

// Create singleton instance of ImpactTracker
const impactTracker = new ImpactTracker();

/**
 * Convenience function to track file changes
 * This is the main API that file operation tools will use
 */
export const trackFileChange = async (filePath, changeType, context = {}) => {
  return await impactTracker.trackFileChange(filePath, changeType, context);
};

/**
 * Convenience function to start batch tracking
 */
export const startBatch = (description) => {
  return impactTracker.startBatch(description);
};

/**
 * Convenience function to commit batch
 */
export const commitBatch = async () => {
  return await impactTracker.commitBatch();
};

/**
 * Convenience function to cancel batch
 */
export const cancelBatch = () => {
  return impactTracker.cancelBatch();
};

/**
 * Convenience function to enable/disable tracking
 */
export const setEnabled = (enabled) => {
  return impactTracker.setEnabled(enabled);
};

/**
 * Convenience function to get statistics
 */
export const getStats = () => {
  return impactTracker.getStats();
};

/**
 * Convenience function to reset statistics
 */
export const resetStats = () => {
  return impactTracker.resetStats();
};

// Export classes for advanced usage
export {
  ImpactTracker,
  PlanResolver,
  ImpactGenerator,
  DatabaseWriter,
  ConfigManager,
  ImpactTrackingConfig,
  configManager,
};

// Export singleton instance
export { impactTracker };

// Default export is the main tracker instance
export default impactTracker;
