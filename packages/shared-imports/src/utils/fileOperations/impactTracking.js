/**
 * Impact Tracking Integration for File Operations
 *
 * Wraps file operations to automatically track impacts
 * Part of automatic-impact-tracking spec - Task 3.1
 */

import { trackFileChange } from "../../../../../apps/wf-server/server/workflows/impact-tracking/index.js";
import createLogger from "../logger.js";

const logger = createLogger("FileOperationsImpactTracking");

/**
 * Add impact tracking to a file operation function
 *
 * @param {Function} originalFunction - The original file operation function
 * @param {string} changeType - Type of change (CREATE, MODIFY, DELETE)
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} Wrapped function with impact tracking
 */
export function withImpactTracking(
  originalFunction,
  changeType,
  operationName
) {
  return async function (...args) {
    let result;
    let filePath = null;
    let context = {};

    try {
      // Execute the original function first
      result = originalFunction.apply(this, args);

      // Extract file path from result or arguments
      if (result && result.success && result.fullPath) {
        filePath = result.fullPath;
      } else if (args.length >= 2) {
        // For createDoc(filePath, fileName, content), construct the path
        const [dirPath, fileName] = args;
        filePath = `${dirPath}/${fileName}`.replace(/\/+/g, "/");
      }

      // Add context from the operation
      context = {
        operation: operationName,
        success: result?.success || false,
        wasOverwrite: result?.wasOverwrite || false,
      };

      // Track the file change if we have a path and the operation succeeded
      if (filePath && result?.success !== false) {
        await trackFileChange(filePath, changeType, context);
        logger.debug(`Impact tracked for ${operationName}`, {
          filePath,
          changeType,
        });
      }
    } catch (error) {
      // If the original function failed, still try to track if we can determine the file path
      if (args.length >= 2) {
        const [dirPath, fileName] = args;
        filePath = `${dirPath}/${fileName}`.replace(/\/+/g, "/");

        context = {
          operation: operationName,
          success: false,
          error: error.message,
        };

        // Track failed operations too (they're still impacts)
        try {
          await trackFileChange(filePath, changeType, context);
          logger.debug(`Impact tracked for failed ${operationName}`, {
            filePath,
            changeType,
            error: error.message,
          });
        } catch (trackingError) {
          logger.warn(`Failed to track impact for failed ${operationName}`, {
            filePath,
            originalError: error.message,
            trackingError: trackingError.message,
          });
        }
      }

      // Re-throw the original error
      throw error;
    }

    return result;
  };
}

/**
 * Create impact tracking context from file operation parameters
 *
 * @param {string} operation - Operation name
 * @param {Array} args - Function arguments
 * @param {Object} result - Operation result
 * @returns {Object} Context object for impact tracking
 */
export function createImpactContext(operation, args, result) {
  const context = {
    operation: operation,
    timestamp: new Date().toISOString(),
  };

  // Add operation-specific context
  switch (operation) {
    case "createDoc":
      if (args.length >= 3) {
        context.contentLength = args[2]?.length || 0;
        context.directory = args[0];
        context.fileName = args[1];
      }
      if (result) {
        context.success = result.success;
        context.wasOverwrite = result.wasOverwrite;
      }
      break;

    default:
      context.args = args.length;
      if (result) {
        context.success = result.success;
      }
  }

  return context;
}

/**
 * Generate description for file operation impact
 *
 * @param {string} operation - Operation name
 * @param {string} changeType - Change type
 * @param {Object} context - Operation context
 * @returns {string} Impact description
 */
export function generateOperationDescription(operation, changeType, context) {
  let description = "";

  switch (operation) {
    case "createDoc":
      if (context.wasOverwrite) {
        description = `Overwrote existing file`;
      } else {
        description = `Created new file`;
      }

      if (context.contentLength) {
        description += ` (${context.contentLength} characters)`;
      }
      break;

    default:
      description = `${changeType.toLowerCase()} file via ${operation}`;
  }

  if (!context.success) {
    description += ` (operation failed)`;
  }

  return description;
}

export default withImpactTracking;
