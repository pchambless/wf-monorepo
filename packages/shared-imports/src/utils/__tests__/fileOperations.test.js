/**
 * Unit tests for fileOperations utility
 * Tests validation, security, and file operation functions
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import path from "path";
import { createDoc } from "../fileOperations.js";

// Mock the logger to avoid console output during tests
jest.mock("../logger.js", () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("fileOperations", () => {
  describe("Input Validation", () => {
    test("should reject non-string filePath", () => {
      const result = createDoc(123, "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject empty filePath", () => {
      const result = createDoc("", "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject whitespace-only filePath", () => {
      const result = createDoc("   ", "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject non-string fileName", () => {
      const result = createDoc("./test", 123, "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("fileName must be a non-empty string");
    });

    test("should reject empty fileName", () => {
      const result = createDoc("./test", "", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("fileName must be a non-empty string");
    });

    test("should reject non-string content", () => {
      const result = createDoc("./test", "test.md", 123);
      expect(result.success).toBe(false);
      expect(result.error).toContain("content must be a string");
    });

    test("should reject content exceeding size limit", () => {
      const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
      const result = createDoc("./test", "test.md", largeContent);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Content size");
      expect(result.error).toContain("exceeds maximum allowed size");
    });

    test("should accept valid inputs", () => {
      // This will fail with implementation pending error, but validates inputs pass
      const result = createDoc("./test", "test.md", "valid content");
      expect(result.error).toBe("createDoc implementation in progress");
      expect(result.code).toBe("IMPLEMENTATION_PENDING");
    });
  });

  describe("Filename Validation", () => {
    test("should reject filenames with invalid characters", () => {
      const invalidNames = [
        "test<file.md",
        "test>file.md",
        "test|file.md",
        "test:file.md",
        "test*file.md",
        "test?file.md",
        'test"file.md',
      ];

      invalidNames.forEach((fileName) => {
        const result = createDoc("./test", fileName, "content");
        expect(result.success).toBe(false);
        expect(result.error).toContain(
          "Invalid filename: only alphanumeric characters, dashes, underscores, and dots are allowed"
        );
      });
    });

    test("should reject reserved system names", () => {
      const reservedNames = [
        "CON.md",
        "PRN.txt",
        "AUX.js",
        "NUL.json",
        "COM1.md",
        "LPT1.txt",
      ];

      reservedNames.forEach((fileName) => {
        const result = createDoc("./test", fileName, "content");
        expect(result.success).toBe(false);
        expect(result.error).toContain("is a reserved system name");
      });
    });

    test("should reject disallowed file extensions", () => {
      const disallowedFiles = [
        "test.exe",
        "test.bat",
        "test.com",
        "test.scr",
        "test.vbs",
      ];

      disallowedFiles.forEach((fileName) => {
        const result = createDoc("./test", fileName, "content");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Invalid file extension");
      });
    });

    test("should accept valid filenames", () => {
      const validNames = [
        "test.md",
        "my-file_v2.txt",
        "component.jsx",
        "config.json",
        "style.css",
        "data.yml",
      ];

      validNames.forEach((fileName) => {
        const result = createDoc("./test", fileName, "content");
        // Should pass filename validation but fail with implementation pending
        expect(result.error).toBe("createDoc implementation in progress");
        expect(result.code).toBe("IMPLEMENTATION_PENDING");
      });
    });

    test("should reject filenames that are too long", () => {
      const longName = "a".repeat(256) + ".md";
      const result = createDoc("./test", longName, "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain(
        "Filename too long: maximum 255 characters allowed"
      );
    });
  });

  describe("Security Validation", () => {
    test("should reject path traversal attempts with ../", () => {
      const result = createDoc("../../../etc", "passwd", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Security violation");
    });

    test("should reject path traversal attempts with ..\\", () => {
      const result = createDoc("..\\..\\..\\windows", "system32", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Security violation");
    });

    test("should reject paths with suspicious patterns", () => {
      const suspiciousPaths = [
        "./../../test",
        ".\\..\\..\\test",
        "test/../../../etc",
      ];

      suspiciousPaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Security violation");
      });
    });

    test("should reject absolute paths outside project directory", () => {
      const result = createDoc("/etc", "passwd", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Security violation");
    });

    test("should accept safe relative paths", () => {
      const safePaths = ["./docs", "src/components", "test/fixtures"];

      safePaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        // Should pass security validation but fail with implementation pending
        expect(result.error).toBe("createDoc implementation in progress");
        expect(result.code).toBe("IMPLEMENTATION_PENDING");
      });
    });

    test("should accept absolute paths within project directory", () => {
      const projectPath = path.resolve(process.cwd(), "docs");
      const result = createDoc(projectPath, "test.md", "content");
      // Should pass security validation but fail with implementation pending
      expect(result.error).toBe("createDoc implementation in progress");
      expect(result.code).toBe("IMPLEMENTATION_PENDING");
    });

    test("should reject paths that resolve outside project boundaries", () => {
      const projectRoot = process.cwd();
      const outsidePath = path.resolve(projectRoot, "../outside-project");
      const result = createDoc(outsidePath, "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Security violation");
    });

    test("should handle mixed path separators correctly", () => {
      const mixedPath = "docs\\\\subfolder//files";
      const result = createDoc(mixedPath, "test.md", "content");
      // Should normalize path separators and pass validation
      expect(result.error).toBe("createDoc implementation in progress");
      expect(result.code).toBe("IMPLEMENTATION_PENDING");
    });

    test("should resolve relative paths correctly", () => {
      const relativePaths = ["./docs", "./src/components", "test/fixtures"];

      relativePaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        // Should resolve relative paths and pass validation
        expect(result.error).toBe("createDoc implementation in progress");
        expect(result.code).toBe("IMPLEMENTATION_PENDING");
      });
    });

    test("should handle nested directory paths correctly", () => {
      const nestedPaths = [
        "docs/guides/setup",
        "src/components/ui/buttons",
        "test/fixtures/data/samples",
      ];

      nestedPaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        // Should handle nested paths correctly
        expect(result.error).toBe("createDoc implementation in progress");
        expect(result.code).toBe("IMPLEMENTATION_PENDING");
      });
    });

    test("should reject paths with parent references in middle", () => {
      const maliciousPaths = [
        "docs/../../../etc",
        "src/components/../../../../../../etc",
        "valid/path/../../../outside",
      ];

      maliciousPaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        expect(result.success).toBe(false);
        expect(result.error).toContain("Security violation");
      });
    });

    test("should handle current directory references safely", () => {
      const currentDirPaths = ["./docs", ".\\src", "./test/./fixtures"];

      currentDirPaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        // Current directory references should be handled safely
        expect(result.error).toBe("createDoc implementation in progress");
        expect(result.code).toBe("IMPLEMENTATION_PENDING");
      });
    });

    test("should validate final file path boundaries", () => {
      // Test that even if directory is valid, final file path is checked
      const result = createDoc("docs", "../outside-file.md", "content");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Security violation");
    });
  });
});
