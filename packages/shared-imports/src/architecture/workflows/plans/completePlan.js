/**
 * Complete Plan Workflow
 * Atomic operation: Plan completion + Documentation + Impact tracking
 *
 * @param {Object} completionData - Plan completion data
 * @param {number} completionData.planId - Plan ID to complete
 * @param {string} completionData.completionNotes - Notes about completion
 * @param {string} completionData.completionStatus - Completion status (default: "completed")
 * @param {string} userID - User identifier for audit trail
 * @returns {Object} { success: boolean, planId: number, message: string }
 */

import { execDml } from "../../../api/index.js";
import { createPlanImpact } from "../shared/utils/createPlanImpact.browser.js";
import { getPlanDetail } from "../shared/utils/getPlanDetail.js";

/**
 * Generate completion document path using consistent naming pattern
 * @param {number} planId - Plan ID
 * @param {string} completionStatus - Completion status
 * @returns {string} Document path
 */
const generateCompletionDocumentPath = (planId, completionStatus) => {
  const paddedId = String(planId).padStart(4, "0");
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  return `claude-plans/b-completed/${paddedId}-completion-${timestamp}.md`;
};

/**
 * Generate completion document content
 * @param {Object} planData - Plan data from database
 * @param {Object} completionData - Completion data
 * @param {string} userID - User completing the plan
 * @returns {string} Markdown content for completion document
 */
const generateCompletionContent = (planData, completionData, userID) => {
  const timestamp = new Date().toISOString();

  return `# Plan ${String(planData.id).padStart(4, "0")} - Completion Record

## Plan Details
- **Plan ID**: ${planData.id}
- **Name**: ${planData.name}
- **Description**: ${planData.description}
- **Cluster**: ${planData.cluster}
- **Priority**: ${planData.priority}
- **Created**: ${planData.created_at}
- **Completed**: ${timestamp}
- **Completed By**: ${userID}

## Completion Status
**Status**: ${completionData.completionStatus || "completed"}

## Completion Notes
${completionData.completionNotes || "No completion notes provided."}

## Summary
Plan ${String(planData.id).padStart(4, "0")} has been marked as ${
    completionData.completionStatus || "completed"
  } by ${userID} on ${timestamp}.

---
*This completion record was generated automatically by the completePlan workflow.*
`;
};

export const completePlan = async (completionData, userID) => {
  // Validate required fields
  if (!completionData.planId) {
    return {
      success: false,
      message: "Missing required field: planId is required",
    };
  }

  if (!userID) {
    return {
      success: false,
      message: "User ID is required for audit trail",
    };
  }

  try {
    const planId = completionData.planId;
    const completionStatus = completionData.completionStatus || "completed";
    const completionNotes = completionData.completionNotes || "";

    // Step 1: Get current plan data using database-first approach
    console.log("Fetching plan data for completion:", planId);
    const planResult = await getPlanDetail(planId);

    if (!planResult.success) {
      throw new Error(`Plan ${planId} not found: ${planResult.error}`);
    }

    const planData = planResult.plan;

    // Check if plan is already completed
    if (planData.status === "completed") {
      return {
        success: false,
        message: `Plan ${planId} is already completed`,
        planId,
      };
    }

    // Step 2: Update plan status to completed
    const planUpdateRecord = {
      status: completionStatus,
      completed_at: new Date().toISOString(),
      completed_by: userID,
      completion_notes: completionNotes,
    };

    console.log("Updating plan status:", planUpdateRecord);
    const planUpdateResult = await execDml("UPDATE", {
      table: "api_wf.plans",
      method: "UPDATE",
      data: {
        where: { id: planId },
        set: planUpdateRecord,
        userID: userID,
      },
    });

    if (!planUpdateResult || !planUpdateResult.success) {
      throw new Error(
        planUpdateResult?.error || "Failed to update plan status"
      );
    }

    // Step 3: Create completion document path and record
    const documentPath = generateCompletionDocumentPath(
      planId,
      completionStatus
    );
    const documentRecord = {
      plan_id: planId,
      document_type: "completion",
      title: `Plan ${String(planId).padStart(4, "0")} Completion Record`,
      file_path: documentPath,
      author: userID,
      status: "final",
    };

    console.log("Creating completion document record:", documentRecord);
    const documentResult = await execDml("INSERT", {
      table: "api_wf.plan_documents",
      method: "INSERT",
      data: {
        ...documentRecord,
        userID: userID,
      },
    });

    if (!documentResult || !documentResult.success) {
      console.warn(
        "Failed to create completion document record:",
        documentResult?.error
      );
      // Don't fail the whole operation if document record creation fails
    }

    // Step 4: Create impact tracking record for completion
    const impactResult = await createPlanImpact({
      planId,
      filePath: documentPath,
      changeType: "MODIFY",
      description: `Plan ${planId} completed with status: ${completionStatus}`,
      agent: userID,
      metadata: {
        documentType: "completion",
        completionStatus,
        completionNotes: completionNotes.substring(0, 200), // Truncate for metadata
        originalStatus: planData.status,
      },
    });

    if (!impactResult.success) {
      console.warn(
        "Failed to create completion impact record:",
        impactResult.error
      );
      // Don't fail the whole operation if impact tracking fails
    }

    // Step 5: Create physical completion document (optional - for record keeping)
    try {
      const completionContent = generateCompletionContent(
        planData,
        completionData,
        userID
      );

      // Use execCreateDoc API for document creation
      const { execCreateDoc } = await import("../../../api/index.js");

      const docCreationResult = await execCreateDoc({
        targetPath: ".kiro/:planId/completion/",
        fileName: "completion-record-:timestamp.md",
        content: completionContent,
        planId: String(planId).padStart(4, "0"),
        timestamp: new Date().toISOString().split("T")[0],
      });

      console.log(
        "Completion document created:",
        docCreationResult.success ? "✅" : "❌"
      );
    } catch (docError) {
      console.warn(
        "Failed to create physical completion document:",
        docError.message
      );
      // Don't fail the whole operation if document creation fails
    }

    // Success - plan completed
    const paddedPlanId = String(planId).padStart(4, "0");

    return {
      success: true,
      planId: planId,
      paddedPlanId: paddedPlanId,
      completionStatus,
      documentPath: documentPath,
      message: `Plan ${paddedPlanId} completed successfully with status: ${completionStatus}`,
      details: {
        planId,
        originalStatus: planData.status,
        newStatus: completionStatus,
        completedBy: userID,
        completedAt: new Date().toISOString(),
        documentPath,
        impactTracked: impactResult.success,
        description: `Plan "${planData.name}" completed by ${userID}.`,
      },
    };
  } catch (error) {
    console.error("Plan completion workflow failed:", error);
    return {
      success: false,
      message: `Plan completion failed: ${error.message}`,
      error: error.message,
      planId: completionData.planId,
    };
  }
};

export default completePlan;
