/**
 * Database-Native Coordination System
 * Plan 0018: Direct database operations instead of file-based coordination
 */

// Import DML operations
import { execDml } from "@whatsfresh/shared-imports/api";

/**
 * Save user communication to database (Plan 0018: Database-native)
 * @param {Object} communicationData - The communication data to save
 * @returns {Promise<Object>} - Result with success status and communication ID
 */
export const saveUserCommunication = async (communicationData) => {
  try {
    // Prepare DML operation for plan_communications table
    const dmlOperation = {
      table: "api_wf.plan_communications",
      operation: "INSERT",
      data: {
        plan_id: parseInt(communicationData.affectedPlans), // Convert to integer
        from_agent: "user",
        to_agent: "claude",
        type: communicationData.type,
        subject: communicationData.subject,
        message: communicationData.message,
        priority: communicationData.priority,
        status: "awaiting-claude-review",
        created_by: "user", // Audit field
        created_at: new Date().toISOString(),
      },
    };

    console.log("Saving communication to database:", dmlOperation);

    // Execute DML operation
    const result = await execDml(dmlOperation);

    if (result && result.success) {
      // Get the inserted ID from the result
      const communicationId = result.insertId || result.id || Date.now();

      return {
        success: true,
        communicationId: `db-${communicationId}`,
        databaseId: communicationId,
        message: `Strategic communication saved to database! (ID: db-${communicationId})`,
        details:
          "Your communication has been saved to the plan_communications table and will be reviewed by Claude.",
      };
    } else {
      throw new Error(result?.error || "Database operation failed");
    }
  } catch (error) {
    console.error("Error saving communication to database:", error);
    return {
      success: false,
      error: error.message,
      message: `Failed to save communication: ${error.message}`,
    };
  }
};

/**
 * Validate required fields for user communication
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation result with isValid flag and missing fields
 */
export const validateUserCommunication = (formData) => {
  const requiredFields = ["subject", "message", "affectedPlans"];
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!formData[field] || formData[field].trim() === "") {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    message:
      missingFields.length > 0
        ? `Please fill in required fields: ${missingFields.join(", ")}`
        : "All required fields are filled",
  };
};

/**
 * Load plan communications from database
 * @param {number} planId - Optional plan ID to filter communications
 * @returns {Promise<Array>} - Array of communications
 */
export const loadPlanCommunications = async (planId = null) => {
  try {
    // Use planCommunicationList eventType (eventID: 102)
    const eventParams = planId ? { planId } : {};

    // Import execEvent for data fetching
    const { execEvent } = await import("@whatsfresh/shared-imports/api");

    const result = await execEvent("planCommunicationList", eventParams);

    if (result && Array.isArray(result)) {
      return {
        success: true,
        communications: result,
        count: result.length,
      };
    } else {
      return {
        success: true,
        communications: [],
        count: 0,
      };
    }
  } catch (error) {
    console.error("Error loading plan communications:", error);
    return {
      success: false,
      error: error.message,
      communications: [],
    };
  }
};
