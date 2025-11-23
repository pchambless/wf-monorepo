import { executeQuery } from "../dbUtils.js";
import {
  buildInsertSQL,
  buildUpdateSQL,
  buildDeleteSQL,
  buildSoftDeleteSQL,
} from "./sqlBuilder.js";
import { executeEventType } from "../executeEventType.js";
import logger from "../logger.js";
import { enhanceErrorResponse } from "../enhanceErrorResponse.js";

const codeName = `[dmlProcessor.js]`;

/**
 * Build event parameters from DML data
 * Converts field names to :fieldName format for parameter substitution
 */
const buildEventParams = (data) => {
  const eventParams = {};
  Object.entries(data).forEach(([fieldName, value]) => {
    eventParams[`:${fieldName}`] = value;
  });
  return eventParams;
};

/**
 * Process DML request with validation, execution, and error handling
 */
export const processDML = async (requestBody, userEmail) => {
  const { method, table, data, primaryKey, listEvent, parentID } = requestBody;

  // Log sanitized parameters
  const sanitizedData = logger.sanitizeLogData(data);
  logger.debug(`${codeName} Processing ${method} on ${table}`, {
    data: sanitizedData,
    primaryKey,
    listEvent,
    parentID  // ADD THIS to see if it's being sent
  });

  // Validate required fields
  if (!method || !table || !data) {
    const error = new Error("method, table, and data are required");
    error.status = 400;
    error.code = "MISSING_REQUIRED_FIELDS";
    throw error;
  }

  // Validate method
  if (!["INSERT", "UPDATE", "DELETE"].includes(method)) {
    const error = new Error(
      `Method must be INSERT, UPDATE, or DELETE. Got: ${method}`
    );
    error.status = 400;
    error.code = "INVALID_METHOD";
    throw error;
  }

  // Get userID for audit trail from context_store
  const { getValDirect } = await import('../../controller/getVal.js');
  const userID = await getValDirect(userEmail, 'firstName', 'raw') || 'system';

  // Add userID to data for SQL generation
  data.userID = userID;

  // Validate primaryKey for UPDATE/DELETE
  if ((method === "UPDATE" || method === "DELETE") && !primaryKey) {
    const error = new Error(`primaryKey is required for ${method} operations`);
    error.status = 400;
    error.code = "MISSING_PRIMARY_KEY";
    throw error;
  }

  // Validate listEvent if provided
  if (listEvent && typeof listEvent !== "string") {
    const error = new Error("listEvent must be a string when provided");
    error.status = 400;
    error.code = "INVALID_LIST_EVENT";
    throw error;
  }

  // Auto-inject parentID for INSERT (e.g., account_id, vendor_id)
  if (method === 'INSERT' && parentID) {
    const parentKey = parentID.replace(/[\[\]]/g, ''); // Remove brackets: [account_id] -> account_id

    if (!data[parentKey]) {
      const parentValue = await getValDirect(userEmail, parentKey, 'raw');
      if (parentValue) {
        data[parentKey] = parentValue;
        logger.debug(`${codeName} Auto-injected ${parentKey} = ${parentValue} for INSERT`);
      }
    }
  }

  let sql;
  let httpMethod;

  // Build SQL based on method
  switch (method) {
    case "INSERT":
      sql = buildInsertSQL(table, data, userID);
      httpMethod = "POST";
      break;

    case "UPDATE":
      sql = buildUpdateSQL(table, data, "id", userID);
      httpMethod = "PATCH";
      break;

    case "DELETE":
      sql = buildDeleteSQL(table, data, primaryKey);
      httpMethod = "DELETE";
      break;
  }

  logger.info(
    `${codeName} Executing ${method} SQL:`,
    logger.sanitizeLogData({ sql })
  );

  try {
    // Execute the SQL
    const result = await executeQuery(sql, httpMethod);

    logger.info(`${codeName} ${method} executed successfully on ${table}`);

    // Build DML result - extract insertId for workflows
    const response = {
      success: true,
      method,
      table,
      result,
      message: `${method} operation completed successfully`,
    };

    // Add top-level insertId for INSERT operations
    if (method === "INSERT" && result[0]?.insertId) {
      response.insertId = result[0].insertId;
    }

    return response;
  } catch (error) {
    // Handle referential integrity errors for DELETE operations
    if (
      method === "DELETE" &&
      (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === 1451)
    ) {
      logger.info(
        `${codeName} DELETE failed due to referential integrity, attempting soft delete`
      );

      try {
        // Fallback to soft delete
        const softDeleteSQL = buildSoftDeleteSQL(table, data, "id", primaryKey, userID);
        logger.info(
          `${codeName} Executing soft delete SQL:`,
          logger.sanitizeLogData({ sql: softDeleteSQL })
        );

        const softResult = await executeQuery(softDeleteSQL, "PATCH");

        logger.info(
          `${codeName} Soft delete executed successfully on ${table}`
        );

        // Build soft delete result - no server-side refresh, handled by client
        return {
          success: true,
          method: "SOFT_DELETE",
          table,
          result: softResult,
          message:
            "Soft delete completed successfully (referential integrity preserved)",
        };
      } catch (softError) {
        logger.error(`${codeName} Soft delete also failed:`, softError);
        const error = new Error("Both hard delete and soft delete failed");
        error.status = 500;
        error.code = "DELETE_FAILED";
        error.details = softError.message;
        throw error;
      }
    }

    // Use enhanced error response for all other errors
    return await enhanceErrorResponse(error, requestBody, method);
  }
};
