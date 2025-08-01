/**
 * Error Handler
 *
 * Consistent error handling patterns across all workflows
 * Provides retryable error detection and user-friendly messages
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ErrorHandler");

class ErrorHandler {
  constructor() {
    this.retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /temporary/i,
      /unavailable/i,
      /502|503|504/i, // HTTP server errors
      /ECONNRESET/i,
      /ETIMEDOUT/i,
    ];

    this.userFriendlyMessages = {
      // Validation errors
      "Missing required plan fields":
        "Please fill in all required fields (Name, Description, Cluster)",
      "Plan ID is required": "Unable to identify the plan to update",
      "Missing required communication fields":
        "Please fill in all required communication fields",
      "userID is required for audit trail":
        "User authentication required for this operation",

      // Database errors
      "Database connection failed": "Unable to save changes. Please try again.",
      "Plan not found": "The selected plan no longer exists",
      "Communication creation failed":
        "Unable to send message. Please try again.",
      "DML operation failed": "Database operation failed. Please try again.",

      // Network errors
      "Network error":
        "Connection problem. Please check your internet connection.",
      "Request timeout": "The operation took too long. Please try again.",
      "Server unavailable":
        "Service temporarily unavailable. Please try again later.",

      // Workflow errors
      "Workflow not found": "The requested operation is not available",
      "Step execution failed":
        "Operation failed at a specific step. Please try again.",
      "Context refresh failed":
        "Unable to update interface. Please refresh the page.",

      // Generic fallback
      "Validation failed": "Please check your input and try again.",
      "Operation failed":
        "The operation could not be completed. Please try again.",
    };
  }

  /**
   * Handle workflow errors with recovery options
   * @param {Error} error - The error that occurred
   * @param {Object} context - Workflow execution context
   * @param {Object} state - Workflow execution state
   * @returns {Promise<Object>} Error handling result
   */
  async handle(error, context, state) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: this.sanitizeContext(context),
      state: this.sanitizeState(state),
      timestamp: new Date().toISOString(),
      workflowStep: state.currentStep,
    };

    // Log error for debugging
    log.error("Workflow error occurred", errorInfo);

    // Determine error characteristics
    const isRetryable = this.isRetryableError(error);
    const userMessage = this.getUserFriendlyMessage(error);
    const errorCategory = this.categorizeError(error);
    const recoveryOptions = this.getRecoveryOptions(error, isRetryable);

    // Record error metrics
    this.recordErrorMetrics(error, errorCategory, context);

    return {
      success: false,
      error: {
        message: userMessage,
        details: error.message,
        retryable: isRetryable,
        category: errorCategory,
        recoveryOptions,
        timestamp: errorInfo.timestamp,
        workflowStep: state.currentStep,
      },
    };
  }

  /**
   * Determine if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} True if error is retryable
   */
  isRetryableError(error) {
    const errorMessage = error.message || "";
    const errorCode = error.code || "";

    // Check against retryable patterns
    const isPatternMatch = this.retryablePatterns.some(
      (pattern) => pattern.test(errorMessage) || pattern.test(errorCode)
    );

    // Check HTTP status codes
    const isRetryableHttpError =
      error.status && [408, 429, 502, 503, 504].includes(error.status);

    // Check specific error types
    const isRetryableType =
      error.name === "TimeoutError" ||
      error.name === "NetworkError" ||
      error.name === "ConnectionError";

    return isPatternMatch || isRetryableHttpError || isRetryableType;
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - The error
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(error) {
    const errorMessage = error.message || "";

    // Check for exact matches first
    if (this.userFriendlyMessages[errorMessage]) {
      return this.userFriendlyMessages[errorMessage];
    }

    // Check for partial matches
    for (const [pattern, message] of Object.entries(
      this.userFriendlyMessages
    )) {
      if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }

    // Check error codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return "Invalid request. Please check your input.";
        case 401:
          return "Authentication required. Please log in.";
        case 403:
          return "You do not have permission to perform this action.";
        case 404:
          return "The requested resource was not found.";
        case 408:
          return "Request timeout. Please try again.";
        case 429:
          return "Too many requests. Please wait and try again.";
        case 500:
          return "Server error. Please try again later.";
        case 502:
        case 503:
        case 504:
          return "Service temporarily unavailable. Please try again later.";
      }
    }

    // Default fallback message
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Categorize error for analytics and handling
   * @param {Error} error - The error to categorize
   * @returns {string} Error category
   */
  categorizeError(error) {
    const message = error.message?.toLowerCase() || "";
    const code = error.code?.toLowerCase() || "";

    if (
      message.includes("validation") ||
      message.includes("required") ||
      message.includes("invalid")
    ) {
      return "validation";
    }

    if (
      message.includes("network") ||
      message.includes("connection") ||
      code.includes("econn")
    ) {
      return "network";
    }

    if (message.includes("timeout") || code.includes("timeout")) {
      return "timeout";
    }

    if (
      message.includes("database") ||
      message.includes("sql") ||
      message.includes("dml")
    ) {
      return "database";
    }

    if (
      message.includes("permission") ||
      message.includes("unauthorized") ||
      error.status === 401 ||
      error.status === 403
    ) {
      return "authorization";
    }

    if (error.status >= 500) {
      return "server";
    }

    if (error.status >= 400 && error.status < 500) {
      return "client";
    }

    return "unknown";
  }

  /**
   * Get recovery options for the error
   * @param {Error} error - The error
   * @param {boolean} isRetryable - Whether error is retryable
   * @returns {Array} Array of recovery options
   */
  getRecoveryOptions(error, isRetryable) {
    const options = [];

    if (isRetryable) {
      options.push({
        type: "retry",
        label: "Try Again",
        description: "Retry the operation",
        automatic: false,
      });
    }

    const category = this.categorizeError(error);

    switch (category) {
      case "validation":
        options.push({
          type: "edit",
          label: "Edit Input",
          description: "Correct the input and try again",
          automatic: false,
        });
        break;

      case "network":
        options.push({
          type: "checkConnection",
          label: "Check Connection",
          description: "Verify your internet connection",
          automatic: false,
        });
        break;

      case "authorization":
        options.push({
          type: "login",
          label: "Log In",
          description: "Re-authenticate and try again",
          automatic: false,
        });
        break;

      case "server":
        options.push({
          type: "waitAndRetry",
          label: "Wait and Retry",
          description: "Wait a moment and try again",
          automatic: true,
          delay: 5000,
        });
        break;
    }

    // Always provide option to cancel/go back
    options.push({
      type: "cancel",
      label: "Cancel",
      description: "Cancel the operation",
      automatic: false,
    });

    return options;
  }

  /**
   * Record error metrics for analytics
   * @param {Error} error - The error
   * @param {string} category - Error category
   * @param {Object} context - Workflow context
   */
  recordErrorMetrics(error, category, context) {
    // In a real implementation, this would send metrics to an analytics service
    log.debug("Error metrics recorded", {
      category,
      message: error.message,
      workflowName: context.workflowName,
      userID: context.userID,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sanitize context for logging (remove sensitive data)
   * @param {Object} context - Context to sanitize
   * @returns {Object} Sanitized context
   */
  sanitizeContext(context) {
    if (!context || typeof context !== "object") {
      return {};
    }

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveFields = [
      "password",
      "token",
      "apiKey",
      "secret",
      "credentials",
      "authorization",
      "cookie",
      "session",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Sanitize state for logging (remove sensitive data)
   * @param {Object} state - State to sanitize
   * @returns {Object} Sanitized state
   */
  sanitizeState(state) {
    if (!state || typeof state !== "object") {
      return {};
    }

    const sanitized = { ...state };

    // Remove sensitive data from state
    if (sanitized.data) {
      sanitized.data = this.sanitizeContext(sanitized.data);
    }

    // Keep only essential state information for logging
    return {
      status: sanitized.status,
      currentStep: sanitized.currentStep,
      startTime: sanitized.startTime,
      endTime: sanitized.endTime,
      errorCount: sanitized.errors?.length || 0,
    };
  }

  /**
   * Add custom user-friendly message
   * @param {string} errorPattern - Error pattern to match
   * @param {string} friendlyMessage - User-friendly message
   */
  addUserFriendlyMessage(errorPattern, friendlyMessage) {
    this.userFriendlyMessages[errorPattern] = friendlyMessage;
  }

  /**
   * Add custom retryable pattern
   * @param {RegExp} pattern - Pattern to match retryable errors
   */
  addRetryablePattern(pattern) {
    if (pattern instanceof RegExp) {
      this.retryablePatterns.push(pattern);
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export class for testing
export { ErrorHandler };

export default errorHandler;
