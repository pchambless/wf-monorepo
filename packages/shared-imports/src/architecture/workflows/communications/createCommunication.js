/**
 * Create Communication Workflow
 * Atomic operation: Communication + Notifications + Optional Files
 *
 * @param {number} planId - Plan ID for communication context
 * @param {string} type - Communication type (strategic-input, priority-change, etc.)
 * @param {string} message - Communication message content
 * @param {string} userID - User identifier for audit trail
 * @returns {Object} { success: boolean, communicationId: number, message: string }
 */

import { execDml } from "../../../api/index.js";

/**
 * Generate communication file path for issue documentation
 * @param {number} planId - Plan ID
 * @param {string} type - Communication type
 * @param {number} communicationId - Communication ID
 * @returns {string} File path
 */
const generateCommunicationPath = (planId, type, communicationId) => {
  const paddedPlanId = String(planId).padStart(4, "0");
  const paddedCommId = String(communicationId).padStart(3, "0");
  return `.kiro/${paddedPlanId}/communications/${paddedCommId}-${type}.md`;
};

export const createCommunication = async (
  planId,
  type,
  subject,
  message,
  userID
) => {
  // Validate required fields
  if (!planId || !type || !subject || !message) {
    return {
      success: false,
      message:
        "Missing required fields: planId, type, subject, and message are required",
    };
  }

  if (!userID) {
    return {
      success: false,
      message: "User ID is required for audit trail",
    };
  }

  try {
    // Step 1: Create communication record in database
    const recipient = getRecipientForType(type);
    const communicationRecord = {
      plan_id: planId,
      from_agent: userID,
      to_agent: recipient,
      type: type,
      subject: subject,
      message: message,
      status: "pending",
      // Audit fields (created_by, created_at) auto-injected by DML processor
    };

    console.log("Creating communication record:", communicationRecord);
    const communicationResult = await execDml("INSERT", {
      table: "api_wf.plan_communications",
      method: "INSERT",
      data: {
        ...communicationRecord,
        userID: userID,
      },
    });

    console.log(
      "Communication result:",
      JSON.stringify(communicationResult, null, 2)
    );

    if (!communicationResult || !communicationResult.success) {
      throw new Error(
        communicationResult?.error || "Failed to create communication record"
      );
    }

    const communicationId =
      communicationResult.insertId || communicationResult.result?.[0]?.insertId;
    const paddedCommunicationId = communicationId.toString().padStart(3, "0");

    // Step 2: Create impact tracking record
    const communicationPath = generateCommunicationPath(
      planId,
      type,
      communicationId
    );
    const impactRecord = {
      plan_id: planId,
      file_path: communicationPath,
      change_type: "COMMUNICATION",
      status: "pending",
      description: `Communication created: ${type}`,
      // Audit fields auto-injected
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

    // Success - all operations completed
    return {
      success: true,
      communicationId: communicationId,
      paddedCommunicationId: paddedCommunicationId,
      communicationPath: communicationPath,
      recipient: getRecipientForType(type),
      message: `Communication ${paddedCommunicationId} created successfully`,
      details: {
        communicationId,
        communicationPath,
        recipient: getRecipientForType(type),
        impactRecords: 1,
        description: `Communication "${type}" created for plan ${planId}.`,
      },
    };
  } catch (error) {
    console.error("Communication creation workflow failed:", error);
    return {
      success: false,
      message: `Communication creation failed: ${error.message}`,
      error: error.message,
    };
  }
};

/**
 * Determine recipient based on communication type
 * @param {string} type - Communication type
 * @returns {string} Recipient identifier
 */
const getRecipientForType = (type) => {
  const recipientMap = {
    "strategic-input": "claude",
    "priority-change": "claude",
    "scope-modification": "claude",
    "architectural-guidance": "kiro",
    "business-requirement": "claude",
    "implementation-request": "kiro",
    "analysis-request": "claude",
    "issue-report": "kiro",
  };

  return recipientMap[type] || "claude"; // Default to claude
};
