/**
 * Error handling utilities for file operations
 */

import createLogger from "../logger.js";

const logger = createLogger("FileErrors");

/**
 * Error type constants
 */
export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SECURITY_ERROR: "SECURITY_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  DISK_ERROR: "DISK_ERROR",
  BACKUP_ERROR: "BACKUP_ERROR",
  DIRECTORY_ERROR: "DIRECTORY_ERROR",
  WRITE_ERROR: "WRITE_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  IMPLEMENTATION_PENDING: "IMPLEMENTATION_PENDING",
};

/**
 * Categorize error based on error message
 * @param {Error} error - Error object to categorize
 * @returns {string} Error category code
 */
export function categorizeError(error) {
  const message = error.message.toLowerCase();

  if (message.includes("must be a") || message.includes("content size")) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }

  if (
    message.includes("invalid filename") ||
    message.includes("reserved system name")
  ) {
    return ERROR_TYPES.VALIDATION_ERROR;
  }

  if (message.includes("security violation")) {
    return ERROR_TYPES.SECURITY_ERROR;
  }

  if (message.includes("permission denied")) {
    return ERROR_TYPES.PERMISSION_ERROR;
  }

  if (message.includes("disk space full")) {
    return ERROR_TYPES.DISK_ERROR;
  }

  if (message.includes("backup")) {
    return ERROR_TYPES.BACKUP_ERROR;
  }

  if (message.includes("directory") || message.includes("create directory")) {
    return ERROR_TYPES.DIRECTORY_ERROR;
  }

  if (message.includes("write") || message.includes("file writing")) {
    return ERROR_TYPES.WRITE_ERROR;
  }

  if (message.includes("createDoc implementation in progress")) {
    return ERROR_TYPES.IMPLEMENTATION_PENDING;
  }

  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Create standardized error response
 * @param {Error} error - Error object
 * @param {Object} context - Additional context for logging
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(error, context = {}) {
  const errorCode = categorizeError(error);

  logger.error("Operation failed", {
    error: error.message,
    code: errorCode,
    ...context,
  });

  return {
    success: false,
    error: error.message,
    message: `Failed to create document: ${error.message}`,
    code: errorCode,
  };
}
