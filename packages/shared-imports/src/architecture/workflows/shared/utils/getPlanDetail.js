/**
 * Database-driven Plan Detail Utility
 * Replaces file-based plan context with direct database queries
 */

import { execEvent } from "../../../../api/index.js";

/**
 * Get plan details from database using planDetail eventType
 * @param {number} planId - Plan ID to query
 * @returns {Promise<Object>} Plan details or error response
 */
export async function getPlanDetail(planId) {
  try {
    // Validate planId
    if (planId === null || planId === undefined) {
      throw new Error("planId is required");
    }

    // Query database using planDetail eventType
    const result = await execEvent("planDetail", { ":planID": planId });

    if (result && result.length > 0) {
      const plan = result[0];

      return {
        success: true,
        plan,
        planId: plan.id,
        name: plan.name,
        status: plan.status,
        cluster: plan.cluster,
        priority: plan.priority,
        description: plan.description,
        assignedTo: plan.assigned_to,
        startedAt: plan.started_at,
        completedAt: plan.completed_at,
        createdAt: plan.created_at,
        createdBy: plan.created_by,
        updatedAt: plan.updated_at,
        updatedBy: plan.updated_by,
        message: `Plan ${planId} details retrieved successfully`,
      };
    } else {
      return {
        success: false,
        error: `Plan ${planId} not found`,
        message: `No plan found with ID ${planId}`,
        planId,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Failed to get plan ${planId} details: ${error.message}`,
      planId,
    };
  }
}

/**
 * Get plan context for workflow operations
 * Provides the same interface as file-based approach but uses database
 * @param {number} planId - Plan ID
 * @returns {Promise<Object>} Plan context object
 */
export async function getPlanContext(planId) {
  const result = await getPlanDetail(planId);

  if (!result.success) {
    return result;
  }

  // Return context object compatible with existing workflow patterns
  return {
    success: true,
    planId: result.planId,
    planData: result.plan,
    context: {
      id: result.planId,
      name: result.name,
      status: result.status,
      cluster: result.cluster,
      priority: result.priority,
      description: result.description,
      assignedTo: result.assignedTo,
      isCompleted: result.status === "completed",
      isPending: result.status === "pending",
      isOngoing: result.status === "ongoing",
      createdBy: result.createdBy,
      createdAt: result.createdAt,
      paddedId: String(result.planId).padStart(4, "0"),
    },
    message: result.message,
  };
}

/**
 * Check if plan exists and is accessible
 * @param {number} planId - Plan ID to check
 * @returns {Promise<boolean>} True if plan exists and is accessible
 */
export async function planExists(planId) {
  const result = await getPlanDetail(planId);
  return result.success;
}

/**
 * Get plan status from database
 * @param {number} planId - Plan ID
 * @returns {Promise<string|null>} Plan status or null if not found
 */
export async function getPlanStatus(planId) {
  const result = await getPlanDetail(planId);
  return result.success ? result.status : null;
}

/**
 * Check if plan is completed
 * @param {number} planId - Plan ID
 * @returns {Promise<boolean>} True if plan is completed
 */
export async function isPlanCompleted(planId) {
  const status = await getPlanStatus(planId);
  return status === "completed";
}

/**
 * Get multiple plan details in batch
 * @param {Array<number>} planIds - Array of plan IDs
 * @returns {Promise<Object>} Batch results
 */
export async function getBatchPlanDetails(planIds) {
  const results = await Promise.allSettled(
    planIds.map((planId) => getPlanDetail(planId))
  );

  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  );
  const failed = results.filter(
    (r) => r.status === "rejected" || !r.value.success
  );

  return {
    success: failed.length === 0,
    total: planIds.length,
    successful: successful.length,
    failed: failed.length,
    plans: successful.map((r) => r.value.plan),
    results: results.map((r) =>
      r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
    ),
  };
}

/**
 * Migration helper: Compare database vs file-based approach
 * @param {number} planId - Plan ID to compare
 * @returns {Promise<Object>} Comparison results
 */
export async function compareApproaches(planId) {
  const dbResult = await getPlanDetail(planId);

  return {
    database: {
      available: dbResult.success,
      data: dbResult.success ? dbResult.plan : null,
      advantages: [
        "Real-time data",
        "Complete metadata",
        "Structured queries",
        "No file I/O overhead",
        "Audit trail included",
      ],
    },
    fileSystem: {
      available: false, // Would need file system check
      data: null,
      disadvantages: [
        "Potential stale data",
        "Limited metadata",
        "File parsing overhead",
        "Manual status management",
        "File system dependencies",
      ],
    },
    recommendation: dbResult.success
      ? "Use database approach for superior performance and data quality"
      : "Database approach preferred but plan not found",
  };
}

export default {
  getPlanDetail,
  getPlanContext,
  planExists,
  getPlanStatus,
  isPlanCompleted,
  getBatchPlanDetails,
  compareApproaches,
};
