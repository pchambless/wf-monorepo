/**
 * Delete Plan Workflow
 * Simple deletion using DML processor's smart deletion logic
 *
 * @param {number} planId - Plan ID to delete
 * @param {string} userID - User identifier for audit trail
 * @returns {Object} { success: boolean, deletionType: string, message: string }
 */

import { execDml } from "../../../api/index.js";

export const deletePlan = async (planId, userID) => {
  // Validate required fields
  if (!planId) {
    return {
      success: false,
      message: "Plan ID is required",
    };
  }

  if (!userID) {
    return {
      success: false,
      message: "User ID is required for audit trail",
    };
  }

  try {
    console.log(`Deleting plan ${planId}...`);

    // Step 1: Archive physical files (future enhancement)
    // TODO: Move files to c-archived/DELETED-NNNN-Plan Name.md

    // Step 2: Delete plan record - DML processor handles smart deletion
    // - If no child records: hard delete (clean removal)
    // - If child records exist: soft delete (sets deleted_at timestamp)
    const planResult = await execDml("DELETE", {
      table: "api_wf.plans",
      method: "DELETE",
      data: { userID: userID },
      primaryKey: planId,
    });

    console.log("Plan deletion result:", JSON.stringify(planResult, null, 2));

    if (!planResult || !planResult.success) {
      throw new Error(planResult?.error || "Failed to delete plan record");
    }

    // Determine if it was hard or soft delete based on affected rows
    const affectedRows =
      planResult.result?.[0]?.affectedRows || planResult.affectedRows || 0;
    const deletionType = affectedRows > 0 ? "hard" : "soft";

    return {
      success: true,
      planId: planId,
      deletionType: deletionType,
      affectedRows: affectedRows,
      message: `Plan ${planId} ${deletionType} deletion completed successfully`,
      details: {
        planId,
        deletionType,
        affectedRows,
        timestamp: new Date().toISOString(),
        description:
          deletionType === "hard"
            ? `Plan ${planId} and all related records permanently deleted (no child records found).`
            : `Plan ${planId} soft deleted with deleted_at timestamp (child records exist).`,
      },
    };
  } catch (error) {
    console.error("Plan deletion workflow failed:", error);
    return {
      success: false,
      message: `Plan deletion failed: ${error.message}`,
      error: error.message,
    };
  }
};
