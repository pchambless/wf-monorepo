/**
 * Unit tests for fileOperations errors module
 * Tests error categorization and response formatting
 */

import { describe, test, expect } from "@jest/globals";
import {
  ERROR_TYPES,
  categorizeError,
  createErrorResponse,
} from "../fileOperations/errors.js";

describe("fileOperations.errors", () => {
  describe("ERROR_TYPES", () => {
    test("should define all required error types", () => {
      expect(ERROR_TYPES).toBeDefined();
      expect(typeof ERROR_TYPES).toBe("object");

      // Check all expected error types exist
      expect(ERROR_TYPES.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
      expect(ERROR_TYPES.SECURITY_ERROR).toBe("SECURITY_ERROR");
      expect(ERROR_TYPES.PERMISSION_ERROR).toBe("PERMISSION_ERROR");
      expect(ERROR_TYPES.DISK_ERROR).toBe("DISK_ERROR");
      expect(ERROR_TYPES.DIRECTORY_ERROR).toBe("DIRECTORY_ERROR");
      expect(ERROR_TYPES.WRITE_ERROR).toBe("WRITE_ERROR");
    });

    test("should have string values for all error types", () => {
      Object.values(ERROR_TYPES).forEach((errorType) => {
        expect(typeof errorType).toBe("string");
        expect(errorType.length).toBeGreaterThan(0);
      });
    });

    test("should have unique values for all error types", () => {
      const values = Object.values(ERROR_TYPES);
      const uniqueValues = [...new Set(values)];
      expect(values.length).toBe(uniqueValues.length);
    });
  });

  describe("categorizeError", () => {
    test("should categorize validation errors", () => {
      const validationErrors = [
        new Error("filePath must be a non-empty string"),
        new Error("fileName must be a non-empty string"),
        new Error("content must be a string"),
        new Error("Content size exceeds maximum allowed size"),
        new Error("Invalid filename: only alphanumeric characters allowed"),
        new Error("Filename too long: maximum 255 characters allowed"),
        new Error("Invalid file extension"),
        new Error("is a reserved system name"),
      ];

      validationErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.VALIDATION_ERROR);
      });
    });

    test("should categorize security errors", () => {
      const securityErrors = [
        new Error("Security violation: path traversal detected"),
        new Error(
          "Security violation: path resolves outside project directory"
        ),
        new Error("Path contains suspicious patterns"),
        new Error("Invalid path: contains null bytes"),
      ];

      securityErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.SECURITY_ERROR);
      });
    });

    test("should categorize permission errors", () => {
      const permissionErrors = [
        { message: "EACCES: permission denied", code: "EACCES" },
        { message: "EPERM: operation not permitted", code: "EPERM" },
        { message: "Access denied", code: "EACCES" },
      ].map(({ message, code }) => {
        const error = new Error(message);
        error.code = code;
        return error;
      });

      permissionErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.PERMISSION_ERROR);
      });
    });

    test("should categorize disk errors", () => {
      const diskErrors = [
        { message: "ENOSPC: no space left on device", code: "ENOSPC" },
        { message: "EMFILE: too many open files", code: "EMFILE" },
        { message: "EIO: i/o error", code: "EIO" },
        { message: "EROFS: read-only file system", code: "EROFS" },
      ].map(({ message, code }) => {
        const error = new Error(message);
        error.code = code;
        return error;
      });

      diskErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.DISK_ERROR);
      });
    });

    test("should categorize directory errors", () => {
      const directoryErrors = [
        { message: "ENOTDIR: not a directory", code: "ENOTDIR" },
        { message: "EEXIST: file already exists", code: "EEXIST" },
        { message: "ENOENT: no such file or directory", code: "ENOENT" },
      ].map(({ message, code }) => {
        const error = new Error(message);
        error.code = code;
        return error;
      });

      directoryErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.DIRECTORY_ERROR);
      });
    });

    test("should categorize write errors", () => {
      const writeErrors = [
        new Error("Failed to write file"),
        new Error("Write operation failed"),
        new Error("Unable to save file"),
        new Error("File write error"),
      ];

      writeErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.WRITE_ERROR);
      });
    });

    test("should default to WRITE_ERROR for unknown errors", () => {
      const unknownErrors = [
        new Error("Some random error"),
        new Error("Unexpected failure"),
        new Error("Unknown issue occurred"),
      ];

      unknownErrors.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.WRITE_ERROR);
      });
    });

    test("should handle errors without messages", () => {
      const emptyError = new Error();
      expect(categorizeError(emptyError)).toBe(ERROR_TYPES.WRITE_ERROR);
    });

    test("should handle null and undefined errors", () => {
      expect(categorizeError(null)).toBe(ERROR_TYPES.WRITE_ERROR);
      expect(categorizeError(undefined)).toBe(ERROR_TYPES.WRITE_ERROR);
    });

    test("should handle non-Error objects", () => {
      const stringError = "String error";
      const objectError = { message: "Object error" };

      expect(categorizeError(stringError)).toBe(ERROR_TYPES.WRITE_ERROR);
      expect(categorizeError(objectError)).toBe(ERROR_TYPES.WRITE_ERROR);
    });

    test("should be case insensitive for error messages", () => {
      const caseVariations = [
        new Error("SECURITY VIOLATION: PATH TRAVERSAL DETECTED"),
        new Error("security violation: path traversal detected"),
        new Error("Security Violation: Path Traversal Detected"),
        new Error("SeCuRiTy ViOlAtIoN: pAtH tRaVeRsAl DeTeCteD"),
      ];

      caseVariations.forEach((error) => {
        expect(categorizeError(error)).toBe(ERROR_TYPES.SECURITY_ERROR);
      });
    });

    test("should handle partial matches in error messages", () => {
      const partialMatches = [
        new Error("The filePath must be a non-empty string value"),
        new Error(
          "Error: Security violation detected in path traversal attempt"
        ),
        new Error("File operation failed: EACCES permission denied for user"),
      ];

      expect(categorizeError(partialMatches[0])).toBe(
        ERROR_TYPES.VALIDATION_ERROR
      );
      expect(categorizeError(partialMatches[1])).toBe(
        ERROR_TYPES.SECURITY_ERROR
      );
      expect(categorizeError(partialMatches[2])).toBe(
        ERROR_TYPES.PERMISSION_ERROR
      );
    });
  });

  describe("createErrorResponse", () => {
    test("should create structured error response", () => {
      const error = new Error("Test error message");
      const context = { filePath: "./test", fileName: "test.md" };

      const response = createErrorResponse(error, context);

      expect(response.success).toBe(false);
      expect(typeof response.error).toBe("string");
      expect(typeof response.message).toBe("string");
      expect(typeof response.code).toBe("string");
      expect(response.error.length).toBeGreaterThan(0);
      expect(response.message.length).toBeGreaterThan(0);
    });

    test("should include technical error message", () => {
      const error = new Error("Technical error details");
      const context = { filePath: "./test", fileName: "test.md" };

      const response = createErrorResponse(error, context);

      expect(response.error).toContain("Technical error details");
    });

    test("should include user-friendly message", () => {
      const error = new Error("filePath must be a non-empty string");
      const context = { filePath: "", fileName: "test.md" };

      const response = createErrorResponse(error, context);

      expect(response.message).toContain("user-friendly");
      expect(response.message).not.toBe(response.error);
    });

    test("should categorize error correctly", () => {
      const validationError = new Error("fileName must be a non-empty string");
      const securityError = new Error(
        "Security violation: path traversal detected"
      );
      const permissionError = new Error("EACCES: permission denied");

      const context = { filePath: "./test", fileName: "test.md" };

      expect(createErrorResponse(validationError, context).code).toBe(
        ERROR_TYPES.VALIDATION_ERROR
      );
      expect(createErrorResponse(securityError, context).code).toBe(
        ERROR_TYPES.SECURITY_ERROR
      );
      expect(createErrorResponse(permissionError, context).code).toBe(
        ERROR_TYPES.PERMISSION_ERROR
      );
    });

    test("should handle different error types with appropriate messages", () => {
      const testCases = [
        {
          error: new Error("filePath must be a non-empty string"),
          expectedCode: ERROR_TYPES.VALIDATION_ERROR,
        },
        {
          error: new Error("Security violation: path traversal detected"),
          expectedCode: ERROR_TYPES.SECURITY_ERROR,
        },
        {
          error: Object.assign(new Error("EACCES: permission denied"), {
            code: "EACCES",
          }),
          expectedCode: ERROR_TYPES.PERMISSION_ERROR,
        },
        {
          error: Object.assign(new Error("ENOSPC: no space left on device"), {
            code: "ENOSPC",
          }),
          expectedCode: ERROR_TYPES.DISK_ERROR,
        },
        {
          error: Object.assign(new Error("ENOTDIR: not a directory"), {
            code: "ENOTDIR",
          }),
          expectedCode: ERROR_TYPES.DIRECTORY_ERROR,
        },
      ];

      const context = { filePath: "./test", fileName: "test.md" };

      testCases.forEach(({ error, expectedCode }) => {
        const response = createErrorResponse(error, context);
        expect(response.code).toBe(expectedCode);
        expect(response.success).toBe(false);
        expect(response.message).toContain("user-friendly");
      });
    });

    test("should handle context information", () => {
      const error = new Error("Test error");
      const context = {
        filePath: "./docs/guides",
        fileName: "installation.md",
        additionalInfo: "extra context",
      };

      const response = createErrorResponse(error, context);

      expect(response.success).toBe(false);
      expect(typeof response.error).toBe("string");
      expect(typeof response.message).toBe("string");
      expect(typeof response.code).toBe("string");
    });

    test("should handle missing context", () => {
      const error = new Error("Test error");

      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(typeof response.error).toBe("string");
      expect(typeof response.message).toBe("string");
      expect(typeof response.code).toBe("string");
    });

    test("should handle null/undefined errors gracefully", () => {
      const context = { filePath: "./test", fileName: "test.md" };

      const nullResponse = createErrorResponse(null, context);
      const undefinedResponse = createErrorResponse(undefined, context);

      expect(nullResponse.success).toBe(false);
      expect(undefinedResponse.success).toBe(false);
      expect(typeof nullResponse.error).toBe("string");
      expect(typeof undefinedResponse.error).toBe("string");
    });

    test("should provide consistent response structure", () => {
      const errors = [
        new Error("Validation error"),
        new Error("Security violation: path traversal"),
        Object.assign(new Error("EACCES: permission denied"), {
          code: "EACCES",
        }),
      ];

      const context = { filePath: "./test", fileName: "test.md" };

      errors.forEach((error) => {
        const response = createErrorResponse(error, context);

        // Check required properties exist
        expect(response).toHaveProperty("success");
        expect(response).toHaveProperty("error");
        expect(response).toHaveProperty("message");
        expect(response).toHaveProperty("code");

        // Check property types
        expect(typeof response.success).toBe("boolean");
        expect(typeof response.error).toBe("string");
        expect(typeof response.message).toBe("string");
        expect(typeof response.code).toBe("string");

        // Check values
        expect(response.success).toBe(false);
        expect(response.error.length).toBeGreaterThan(0);
        expect(response.message.length).toBeGreaterThan(0);
        expect(response.code.length).toBeGreaterThan(0);
      });
    });

    test("should differentiate between technical and user-friendly messages", () => {
      const technicalError = new Error(
        "EACCES: permission denied, open '/restricted/file.txt'"
      );
      const context = { filePath: "./restricted", fileName: "file.txt" };

      const response = createErrorResponse(technicalError, context);

      expect(response.error).toContain("EACCES");
      expect(response.message).toContain("user-friendly");
      expect(response.message).not.toContain("EACCES");
      expect(response.error).not.toBe(response.message);
    });
  });

  describe("Error Integration", () => {
    test("should work together for complete error handling workflow", () => {
      const testErrors = [
        new Error("filePath must be a non-empty string"),
        new Error("Security violation: path traversal detected"),
        Object.assign(new Error("EACCES: permission denied"), {
          code: "EACCES",
        }),
        Object.assign(new Error("ENOSPC: no space left on device"), {
          code: "ENOSPC",
        }),
        new Error("Unknown error type"),
      ];

      const context = { filePath: "./test", fileName: "test.md" };

      testErrors.forEach((error) => {
        // Test categorization
        const category = categorizeError(error);
        expect(typeof category).toBe("string");
        expect(Object.values(ERROR_TYPES)).toContain(category);

        // Test response creation
        const response = createErrorResponse(error, context);
        expect(response.success).toBe(false);
        expect(response.code).toBe(category);

        // Verify consistency
        expect(response.code).toBe(categorizeError(error));
      });
    });

    test("should handle edge cases consistently", () => {
      const edgeCases = [
        null,
        undefined,
        "",
        new Error(""),
        { message: "Not an Error object" },
        "String error",
      ];

      const context = { filePath: "./test", fileName: "test.md" };

      edgeCases.forEach((errorCase) => {
        const category = categorizeError(errorCase);
        const response = createErrorResponse(errorCase, context);

        expect(typeof category).toBe("string");
        expect(response.success).toBe(false);
        expect(response.code).toBe(category);
        expect(typeof response.error).toBe("string");
        expect(typeof response.message).toBe("string");
      });
    });
  });
});
