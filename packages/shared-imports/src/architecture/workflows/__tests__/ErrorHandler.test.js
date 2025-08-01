/**
 * ErrorHandler Tests
 */

import { ErrorHandler } from "../ErrorHandler.js";

describe("ErrorHandler", () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe("isRetryableError", () => {
    it("should identify network errors as retryable", () => {
      const networkError = new Error("Network connection failed");
      expect(errorHandler.isRetryableError(networkError)).toBe(true);
    });

    it("should identify timeout errors as retryable", () => {
      const timeoutError = new Error("Request timeout");
      expect(errorHandler.isRetryableError(timeoutError)).toBe(true);
    });

    it("should identify HTTP 5xx errors as retryable", () => {
      const serverError = new Error("Server error");
      serverError.status = 503;
      expect(errorHandler.isRetryableError(serverError)).toBe(true);
    });

    it("should identify validation errors as non-retryable", () => {
      const validationError = new Error("Missing required fields");
      expect(errorHandler.isRetryableError(validationError)).toBe(false);
    });

    it("should identify authorization errors as non-retryable", () => {
      const authError = new Error("Unauthorized");
      authError.status = 401;
      expect(errorHandler.isRetryableError(authError)).toBe(false);
    });
  });

  describe("getUserFriendlyMessage", () => {
    it("should return exact match for known errors", () => {
      const error = new Error("Missing required plan fields");
      const message = errorHandler.getUserFriendlyMessage(error);
      expect(message).toBe(
        "Please fill in all required fields (Name, Description, Cluster)"
      );
    });

    it("should return status-based message for HTTP errors", () => {
      const error = new Error("Not found");
      error.status = 404;
      const message = errorHandler.getUserFriendlyMessage(error);
      expect(message).toBe("The requested resource was not found.");
    });

    it("should return default message for unknown errors", () => {
      const error = new Error("Some unknown error");
      const message = errorHandler.getUserFriendlyMessage(error);
      expect(message).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("categorizeError", () => {
    it("should categorize validation errors correctly", () => {
      const error = new Error("Validation failed: missing required field");
      expect(errorHandler.categorizeError(error)).toBe("validation");
    });

    it("should categorize network errors correctly", () => {
      const error = new Error("Network connection failed");
      expect(errorHandler.categorizeError(error)).toBe("network");
    });

    it("should categorize timeout errors correctly", () => {
      const error = new Error("Request timeout");
      expect(errorHandler.categorizeError(error)).toBe("timeout");
    });

    it("should categorize database errors correctly", () => {
      const error = new Error("Database connection failed");
      expect(errorHandler.categorizeError(error)).toBe("database");
    });

    it("should categorize authorization errors correctly", () => {
      const error = new Error("Unauthorized access");
      error.status = 401;
      expect(errorHandler.categorizeError(error)).toBe("authorization");
    });

    it("should categorize server errors correctly", () => {
      const error = new Error("Internal server error");
      error.status = 500;
      expect(errorHandler.categorizeError(error)).toBe("server");
    });

    it("should categorize unknown errors correctly", () => {
      const error = new Error("Some weird error");
      expect(errorHandler.categorizeError(error)).toBe("unknown");
    });
  });

  describe("getRecoveryOptions", () => {
    it("should include retry option for retryable errors", () => {
      const error = new Error("Network timeout");
      const options = errorHandler.getRecoveryOptions(error, true);

      const retryOption = options.find((opt) => opt.type === "retry");
      expect(retryOption).toBeTruthy();
      expect(retryOption.label).toBe("Try Again");
    });

    it("should include edit option for validation errors", () => {
      const error = new Error("Validation failed");
      const options = errorHandler.getRecoveryOptions(error, false);

      const editOption = options.find((opt) => opt.type === "edit");
      expect(editOption).toBeTruthy();
      expect(editOption.label).toBe("Edit Input");
    });

    it("should include login option for authorization errors", () => {
      const error = new Error("Unauthorized");
      error.status = 401;
      const options = errorHandler.getRecoveryOptions(error, false);

      const loginOption = options.find((opt) => opt.type === "login");
      expect(loginOption).toBeTruthy();
      expect(loginOption.label).toBe("Log In");
    });

    it("should always include cancel option", () => {
      const error = new Error("Any error");
      const options = errorHandler.getRecoveryOptions(error, false);

      const cancelOption = options.find((opt) => opt.type === "cancel");
      expect(cancelOption).toBeTruthy();
      expect(cancelOption.label).toBe("Cancel");
    });
  });

  describe("handle", () => {
    it("should return comprehensive error result", async () => {
      const error = new Error("Test error");
      const context = { userID: "testUser", workflowName: "testWorkflow" };
      const state = { currentStep: "testStep", status: "running" };

      const result = await errorHandler.handle(error, context, state);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBeTruthy();
      expect(result.error.details).toBe("Test error");
      expect(result.error.workflowStep).toBe("testStep");
      expect(result.error.recoveryOptions).toBeTruthy();
    });
  });

  describe("sanitizeContext", () => {
    it("should remove sensitive fields", () => {
      const context = {
        userID: "testUser",
        password: "secret123",
        token: "abc123",
        normalField: "normalValue",
      };

      const sanitized = errorHandler.sanitizeContext(context);

      expect(sanitized.userID).toBe("testUser");
      expect(sanitized.normalField).toBe("normalValue");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.token).toBe("[REDACTED]");
    });

    it("should handle null/undefined context", () => {
      expect(errorHandler.sanitizeContext(null)).toEqual({});
      expect(errorHandler.sanitizeContext(undefined)).toEqual({});
    });
  });

  describe("addUserFriendlyMessage", () => {
    it("should add custom user-friendly message", () => {
      errorHandler.addUserFriendlyMessage(
        "Custom error",
        "Custom friendly message"
      );

      const error = new Error("Custom error");
      const message = errorHandler.getUserFriendlyMessage(error);
      expect(message).toBe("Custom friendly message");
    });
  });

  describe("addRetryablePattern", () => {
    it("should add custom retryable pattern", () => {
      const customPattern = /custom.*error/i;
      errorHandler.addRetryablePattern(customPattern);

      const error = new Error("Custom retryable error");
      expect(errorHandler.isRetryableError(error)).toBe(true);
    });
  });
});
