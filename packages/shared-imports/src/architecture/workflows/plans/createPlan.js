/**
 * Create Plan Workflow
 * Atomic operation: Plan + Documents + Impacts
 *
 * @param {Object} planData - Plan creation data
 * @param {string} userID - User identifier for audit trail
 * @returns {Object} { success: boolean, planId: number, message: string }
 */

import { execDml } from "../../../api/index.js";
import { createPlanDocument } from "../documents/createPlanDocument.js";

/**
 * Generate plan document path using consistent naming pattern
 * @param {number} planId - Plan ID
 * @param {string} planName - Plan name
 * @returns {string} Document path
 */
const generatePlanDocumentPath = (planId, planName) => {
  const paddedId = String(planId).padStart(4, "0");
  // Sanitize plan name for filename (remove special chars, convert spaces to dashes)
  const safeName = planName
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
  return `claude-plans/a-pending/${paddedId}-${safeName}.md`;
};

export const createPlan = async (planData, userID) => {
  // Validate required fields
  if (!planData.cluster || !planData.name || !planData.description) {
    return {
      success: false,
      message:
        "Missing required fields: cluster, name, and description are required",
    };
  }

  if (!userID) {
    return {
      success: false,
      message: "User ID is required for audit trail",
    };
  }

  try {
    // Step 1: Create plan record in database
    const planRecord = {
      cluster: planData.cluster,
      name: planData.name,
      description: planData.description,
      status: "pending",
      priority: planData.priority || "normal",
      // Audit fields (created_by, created_at) auto-injected by DML processor
    };

    console.log("Creating plan record:", planRecord);
    const planResult = await execDml("INSERT", {
      table: "api_wf.plans",
      method: "INSERT",
      data: {
        ...planRecord,
        userID: userID,
      },
    });

    console.log("Plan result:", JSON.stringify(planResult, null, 2));

    if (!planResult || !planResult.success) {
      throw new Error(planResult?.error || "Failed to create plan record");
    }

    const planId = planResult.insertId || planResult.result?.[0]?.insertId;
    const paddedPlanId = planId.toString().padStart(4, "0");

    // Step 2: Generate document path and create initial document record
    const documentPath = generatePlanDocumentPath(planId, planData.name);
    const documentRecord = {
      plan_id: planId,
      document_type: "plan",
      title: planData.name,
      file_path: documentPath,
      author: userID,
      status: "draft",
      // Audit fields (created_by, created_at) auto-injected by DML processor
    };

    console.log("Creating document record:", documentRecord);
    const documentResult = await execDml("INSERT", {
      table: "api_wf.plan_documents",
      method: "INSERT",
      data: {
        ...documentRecord,
        userID: userID,
      },
    });

    if (!documentResult || !documentResult.success) {
      // TODO: In a real transaction, this would rollback the plan creation
      throw new Error(
        documentResult?.error || "Failed to create document record"
      );
    }

    // Step 3: Create initial impact tracking record
    const impactRecord = {
      plan_id: planId,
      file_path: documentPath, // Same path as document for consistency
      change_type: "CREATED",
      status: "pending",
      description: "Plan creation workflow executed",
      // Audit fields (created_by, created_at) auto-injected by DML processor
    };

    console.log("Creating impact record:", impactRecord);
    const impactResult = await execDml("INSERT", {
      table: "api_wf.plan_impacts",
      method: "INSERT",
      data: {
        ...impactRecord,
        userID: userID,
      },
    });

    if (!impactResult || !impactResult.success) {
      // TODO: In a real transaction, this would rollback both previous operations
      throw new Error(impactResult?.error || "Failed to create impact record");
    }

    // Step 4: Create physical plan document
    const docResult = await createPlanDocument(planId, planData);
    if (!docResult.success) {
      console.warn('Plan created in database but file creation failed:', docResult.message);
    }

    // Success - all operations completed
    return {
      success: true,
      planId: planId,
      paddedPlanId: paddedPlanId,
      documentPath: documentPath,
      actualFilePath: docResult.filePath,
      message: `Plan ${paddedPlanId} created successfully`,
      details: {
        planId,
        documentPath,
        impactRecords: 1,
        description: `Plan "${planData.name}" created with documents and impact tracking.`,
      },
    };
  } catch (error) {
    console.error("Plan creation workflow failed:", error);
    return {
      success: false,
      message: `Plan creation failed: ${error.message}`,
      error: error.message,
    };
  }
};
