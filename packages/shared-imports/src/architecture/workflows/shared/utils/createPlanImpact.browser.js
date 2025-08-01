/**
 * Browser-safe Plan Impact Tracking Workflow
 * Uses API endpoints instead of direct DML calls
 */

import { execDml } from "../../../../api/index.js";

/**
 * Create plan impact record for file changes (Browser-safe version)
 * @param {Object} params - Impact tracking parameters
 * @param {string|number} params.planId - Plan ID
 * @param {string} params.filePath - Full path to affected file
 * @param {string} params.changeType - Type of change (CREATE, MODIFY, DELETE, MOVE)
 * @param {string} params.description - Human-readable description of change
 * @param {string} params.agent - Agent that made the change (claude, kiro, user)
 * @param {Object} [params.metadata] - Additional metadata about the change
 * @returns {Promise<Object>} DML result with success status
 */
export async function createPlanImpact({
  planId,
  filePath,
  changeType,
  description,
  agent,
  metadata = {},
}) {
  try {
    // Validate required parameters (planId can be 0 for Adhoc-Operations)
    if (
      planId === null ||
      planId === undefined ||
      !filePath ||
      !changeType ||
      !description ||
      !agent
    ) {
      throw new Error(
        "Missing required parameters: planId, filePath, changeType, description, agent"
      );
    }

    // Validate changeType
    const validChangeTypes = ["CREATE", "MODIFY", "DELETE", "MOVE"];
    if (!validChangeTypes.includes(changeType)) {
      throw new Error(
        `Invalid changeType: ${changeType}. Must be one of: ${validChangeTypes.join(
          ", "
        )}`
      );
    }

    // Create impact record using browser-safe DML API
    // Don't specify created_by manually - it's auto-added by audit fields
    const result = await execDml("INSERT", {
      table: "api_wf.plan_impacts",
      method: "INSERT",
      data: {
        plan_id: planId,
        file_path: filePath,
        change_type: changeType,
        description,
        status: "completed",
        userID: agent, // Required for audit trail (becomes created_by)
      },
    });

    return {
      success: result.success,
      impactId: result.insertId,
      planId,
      filePath,
      changeType,
      description,
      agent,
      message: result.success
        ? `Plan impact recorded: ${changeType} ${filePath}`
        : result.message || result.error || "Unknown error",
      rawResult: result, // Include raw result for debugging
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Failed to record plan impact: ${error.message}`,
      planId,
      filePath,
      changeType,
    };
  }
}

/**
 * Create multiple plan impacts in batch (Browser-safe version)
 * @param {Array<Object>} impacts - Array of impact objects
 * @returns {Promise<Object>} Batch result with success count
 */
export async function createPlanImpactBatch(impacts) {
  const results = await Promise.allSettled(
    impacts.map((impact) => createPlanImpact(impact))
  );

  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  );
  const failed = results.filter(
    (r) => r.status === "rejected" || !r.value.success
  );

  return {
    success: failed.length === 0,
    total: impacts.length,
    successful: successful.length,
    failed: failed.length,
    results: results.map((r) =>
      r.status === "fulfilled" ? r.value : { success: false, error: r.reason }
    ),
  };
}

/**
 * Helper function for document creation impacts (Browser-safe version)
 * @param {Object} docResult - Result from execCreateDoc
 * @param {string|number} planId - Plan ID
 * @param {string} agent - Agent that created document
 * @param {string} [description] - Custom description (auto-generated if not provided)
 * @returns {Promise<Object>} Impact tracking result
 */
export async function trackDocumentCreation(
  docResult,
  planId,
  agent,
  description = null
) {
  if (!docResult.success) {
    return {
      success: false,
      message: "Cannot track impact for failed document creation",
    };
  }

  const autoDescription =
    description ||
    `Created ${docResult.template || "document"} for plan ${planId}`;

  return await createPlanImpact({
    planId,
    filePath: docResult.fullPath,
    changeType: "CREATE",
    description: autoDescription,
    agent,
    metadata: {
      template: docResult.template,
      resolvedPath: docResult.resolvedPath,
      resolvedFileName: docResult.resolvedFileName,
    },
  });
}

export default createPlanImpact;
