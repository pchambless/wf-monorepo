/**
 * ContextRefreshManager - Phase 3: Context Management
 * Manages context refresh operations for workflow execution
 * Handles planList, planContext, and other context updates
 */

import { execEvent } from "../../../api/index.js";
const codeName = `[ContextRefreshManager.js]`;
const logger = console;

/**
 * Refresh multiple contexts based on configuration
 * @param {Array} contextTypes - Array of context types to refresh
 * @param {Object} params - Parameters for context refresh
 * @returns {Promise<Object>} Refresh result
 */
export async function refreshContexts(contextTypes, params = {}) {
  logger.debug(`${codeName} Refreshing contexts:`, { contextTypes, params });

  const results = {};
  const errors = [];

  try {
    // Refresh each context type
    for (const contextType of contextTypes) {
      try {
        const result = await refreshSingleContext(contextType, params);
        results[contextType] = result;
        logger.debug(
          `${codeName} Context ${contextType} refreshed successfully`
        );
      } catch (error) {
        logger.error(
          `${codeName} Failed to refresh context ${contextType}:`,
          error
        );
        errors.push({ contextType, error: error.message });
        results[contextType] = { success: false, error: error.message };
      }
    }

    const success = errors.length === 0;
    logger.info(
      `${codeName} Context refresh completed: ${
        success ? "success" : "partial failure"
      }`
    );

    return {
      success,
      results,
      errors,
      refreshedContexts: Object.keys(results).filter(
        (key) => results[key].success
      ),
    };
  } catch (error) {
    logger.error(`${codeName} Context refresh failed:`, error);
    return {
      success: false,
      error: error.message,
      results,
      errors,
    };
  }
}

/**
 * Refresh a single context type
 * @param {string} contextType - Type of context to refresh
 * @param {Object} params - Parameters for refresh
 * @returns {Promise<Object>} Refresh result
 */
async function refreshSingleContext(contextType, params) {
  logger.debug(`${codeName} Refreshing single context: ${contextType}`);

  switch (contextType) {
    case "planList":
      return await refreshPlanList(params);
    case "planContext":
      return await refreshPlanContext(params);
    case "communicationHistory":
      return await refreshCommunicationHistory(params);
    case "impactTracking":
      return await refreshImpactTracking(params);
    default:
      throw new Error(`Unknown context type: ${contextType}`);
  }
}

/**
 * Refresh plan list context
 * @param {Object} params - Refresh parameters
 * @returns {Promise<Object>} Refresh result
 */
async function refreshPlanList(params = {}) {
  logger.debug(`${codeName} Refreshing planList context`);

  try {
    // Use the established execEvent pattern
    const result = await execEvent("planList", params);

    if (result && (result.success || result.data || Array.isArray(result))) {
      const planData = result.data || result || [];

      logger.info(
        `${codeName} PlanList context refreshed: ${planData.length} plans`
      );

      return {
        success: true,
        contextType: "planList",
        data: planData,
        count: planData.length,
        refreshedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Failed to load plan list data");
    }
  } catch (error) {
    logger.error(`${codeName} PlanList refresh failed:`, error);
    throw error;
  }
}

/**
 * Refresh plan context (specific plan details)
 * @param {Object} params - Must include planID
 * @returns {Promise<Object>} Refresh result
 */
async function refreshPlanContext(params) {
  logger.debug(`${codeName} Refreshing planContext`);

  if (!params[":planID"]) {
    throw new Error("planID parameter required for planContext refresh");
  }

  try {
    const result = await execEvent("planDetailList", params);

    if (result && result.success && result.data?.length > 0) {
      const planDetail = result.data[0];

      logger.info(
        `${codeName} PlanContext refreshed for plan: ${planDetail.id}`
      );

      return {
        success: true,
        contextType: "planContext",
        data: planDetail,
        planId: planDetail.id,
        refreshedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Failed to load plan detail data");
    }
  } catch (error) {
    logger.error(`${codeName} PlanContext refresh failed:`, error);
    throw error;
  }
}

/**
 * Refresh communication history context
 * @param {Object} params - Must include planID
 * @returns {Promise<Object>} Refresh result
 */
async function refreshCommunicationHistory(params) {
  logger.debug(`${codeName} Refreshing communicationHistory`);

  if (!params[":planID"]) {
    throw new Error(
      "planID parameter required for communicationHistory refresh"
    );
  }

  try {
    const result = await execEvent("planCommunicationList", params);

    if (result && (result.success || result.data || Array.isArray(result))) {
      const communications = result.data || result || [];

      logger.info(
        `${codeName} CommunicationHistory refreshed: ${communications.length} communications`
      );

      return {
        success: true,
        contextType: "communicationHistory",
        data: communications,
        count: communications.length,
        planId: params[":planID"],
        refreshedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Failed to load communication history data");
    }
  } catch (error) {
    logger.error(`${codeName} CommunicationHistory refresh failed:`, error);
    throw error;
  }
}

/**
 * Refresh impact tracking context
 * @param {Object} params - May include planID for plan-specific impacts
 * @returns {Promise<Object>} Refresh result
 */
async function refreshImpactTracking(params) {
  logger.debug(`${codeName} Refreshing impactTracking`);

  try {
    const eventType = params[":planID"]
      ? "planImpactList"
      : "impactTrackingList";
    const result = await execEvent(eventType, params);

    if (result && (result.success || result.data || Array.isArray(result))) {
      const impacts = result.data || result || [];

      logger.info(
        `${codeName} ImpactTracking refreshed: ${impacts.length} impacts`
      );

      return {
        success: true,
        contextType: "impactTracking",
        data: impacts,
        count: impacts.length,
        planId: params[":planID"] || null,
        refreshedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Failed to load impact tracking data");
    }
  } catch (error) {
    logger.error(`${codeName} ImpactTracking refresh failed:`, error);
    throw error;
  }
}

/**
 * Propagate context updates to UI components
 * @param {Object} refreshResults - Results from context refresh
 * @param {Function} updateCallback - Callback to update UI state
 * @returns {Promise<void>}
 */
export async function propagateContextUpdates(refreshResults, updateCallback) {
  logger.debug(`${codeName} Propagating context updates`);

  try {
    if (!refreshResults.success) {
      logger.warn(`${codeName} Skipping propagation due to refresh failure`);
      return;
    }

    // Propagate each successful context update
    for (const [contextType, result] of Object.entries(
      refreshResults.results
    )) {
      if (result.success) {
        await updateCallback(contextType, result.data);
        logger.debug(`${codeName} Propagated ${contextType} update to UI`);
      }
    }

    logger.info(`${codeName} Context propagation completed`);
  } catch (error) {
    logger.error(`${codeName} Context propagation failed:`, error);
    throw error;
  }
}

/**
 * Get context refresh configuration for an eventType
 * @param {string} eventType - EventType name
 * @returns {Array} Context types to refresh
 */
export function getContextRefreshConfig(eventType) {
  // Configuration mapping eventTypes to contexts they should refresh
  const refreshConfig = {
    planList: ["planList"],
    planDetailList: ["planContext"],
    planCommunicationList: ["communicationHistory"],
    planImpactList: ["impactTracking"],
    createPlan: ["planList", "impactTracking"],
    updatePlan: ["planList", "planContext", "impactTracking"],
    createCommunication: ["communicationHistory"],
    trackImpact: ["impactTracking"],
  };

  return refreshConfig[eventType] || [];
}

export default {
  refreshContexts,
  propagateContextUpdates,
  getContextRefreshConfig,
};
