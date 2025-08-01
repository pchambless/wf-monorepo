/**
 * Error Handler - Phase 4: Error Handling and Recovery
 * Centralized error handling with user-friendly messages and retry logic
 */

import { executeWorkflows } from "@whatsfresh/shared-imports/workflows/eventType";

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: "network",
  VALIDATION: "validation",
  PERMISSION: "permission",
  DATA: "data",
  WORKFLOW: "workflow",
  UNKNOWN: "unknown",
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]:
    "Connection issue. Please check your internet connection and try again.",
  [ERROR_TYPES.VALIDATION]: "Please check your input and try again.",
  [ERROR_TYPES.PERMISSION]: "You don't have permission to perform this action.",
  [ERROR_TYPES.DATA]:
    "There was an issue with the data. Please refresh and try again.",
  [ERROR_TYPES.WORKFLOW]:
    "A system process failed. Please try again or contact support.",
  [ERROR_TYPES.UNKNOWN]: "An unexpected error occurred. Please try again.",
};

/**
 * Categorize error based on error object
 */
export function categorizeError(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;

  const message = error.message?.toLowerCase() || "";
  const status = error.status || error.code;

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    status === "NETWORK_ERROR"
  ) {
    return ERROR_TYPES.NETWORK;
  }

  // Permission errors
  if (
    status === 401 ||
    status === 403 ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return ERROR_TYPES.PERMISSION;
  }

  // Validation errors
  if (
    status === 400 ||
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return ERROR_TYPES.VALIDATION;
  }

  // Data errors
  if (
    status === 404 ||
    status === 422 ||
    message.includes("not found") ||
    message.includes("data")
  ) {
    return ERROR_TYPES.DATA;
  }

  // Workflow errors
  if (message.includes("workflow") || message.includes("execution")) {
    return ERROR_TYPES.WORKFLOW;
  }

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error) {
  const errorType = categorizeError(error);
  return ERROR_MESSAGES[errorType];
}

/**
 * Determine if error is retryable
 */
export function isRetryable(error) {
  const errorType = categorizeError(error);
  return [ERROR_TYPES.NETWORK, ERROR_TYPES.DATA, ERROR_TYPES.WORKFLOW].includes(
    errorType
  );
}

/**
 * Main error handler class
 */
export class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      showUserMessages: true,
      logErrors: true,
      executeErrorWorkflows: true,
      ...options,
    };

    this.retryAttempts = new Map();
  }

  /**
   * Handle error with retry logic and user feedback
   */
  async handleError(error, context = {}) {
    const errorId = this.generateErrorId();
    const errorType = categorizeError(error);
    const userMessage = getUserFriendlyMessage(error);

    // Log error if enabled
    if (this.options.logErrors) {
      console.error(`[ErrorHandler] ${errorId}:`, {
        error,
        errorType,
        context,
        timestamp: new Date().toISOString(),
      });
    }

    // Execute error workflows if enabled
    if (this.options.executeErrorWorkflows) {
      try {
        await this.executeErrorWorkflows(error, context);
      } catch (workflowError) {
        console.error("Error workflow execution failed:", workflowError);
      }
    }

    // Return error information for UI handling
    return {
      errorId,
      errorType,
      userMessage,
      originalError: error,
      isRetryable: isRetryable(error),
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, context = {}) {
    const operationId = context.operationId || this.generateErrorId();
    const currentAttempts = this.retryAttempts.get(operationId) || 0;

    if (currentAttempts >= this.options.maxRetries) {
      throw new Error(
        `Max retry attempts (${this.options.maxRetries}) exceeded for operation: ${operationId}`
      );
    }

    try {
      const result = await operation();
      // Clear retry attempts on success
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      const newAttempts = currentAttempts + 1;
      this.retryAttempts.set(operationId, newAttempts);

      if (!isRetryable(error) || newAttempts >= this.options.maxRetries) {
        this.retryAttempts.delete(operationId);
        throw error;
      }

      // Wait before retry with exponential backoff
      const delay = this.options.retryDelay * Math.pow(2, currentAttempts);
      console.log(
        `Retrying operation ${operationId} in ${delay}ms (attempt ${newAttempts}/${this.options.maxRetries})`
      );

      await this.sleep(delay);
      return this.retryOperation(operation, { ...context, operationId });
    }
  }

  /**
   * Execute error workflows
   */
  async executeErrorWorkflows(error, context) {
    try {
      const errorContext = {
        ...context,
        error: {
          message: error.message,
          type: categorizeError(error),
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
      };

      // Execute generic error workflow
      await executeWorkflows("errorHandling", "onError", errorContext);
    } catch (workflowError) {
      console.error("Error workflow failed:", workflowError);
    }
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear retry attempts for an operation
   */
  clearRetryAttempts(operationId) {
    this.retryAttempts.delete(operationId);
  }

  /**
   * Get retry statistics
   */
  getRetryStats() {
    return {
      activeRetries: this.retryAttempts.size,
      retryAttempts: Object.fromEntries(this.retryAttempts),
    };
  }
}

// Create default error handler instance
export const defaultErrorHandler = new ErrorHandler();

// Convenience functions using default handler
export const handleError = (error, context) =>
  defaultErrorHandler.handleError(error, context);
export const retryOperation = (operation, context) =>
  defaultErrorHandler.retryOperation(operation, context);

export default ErrorHandler;
