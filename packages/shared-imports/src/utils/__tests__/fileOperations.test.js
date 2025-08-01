/**
 * Comprehensive test suite for fileOperations utility
 * Tests validation, security, directory management, file operations, and error handling
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import path from "path";
import fs from "fs";
import os from "os";
import {
  createDoc,
  validateInputs,
  validateFileName,
  validateSecurity,
  ensureDirectory,
  directoryExists,
  fileExists,
  writeFile,
  ERROR_TYPES,
  categorizeError,
} from "../fileOperations.js";

// Mock the logger to avoid console output during tests
jest.mock("../logger.js", () => ({
  __esModule: true,
  default: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Test directory setup
const TEST_DIR = path.join(os.tmpdir(), "fileOperations-test-" + Date.now());
const ORIGINAL_CWD = process.cwd();

describe("fileOperations", () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    // Change to test directory for relative path tests
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(ORIGINAL_CWD);
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("Input Validation", () => {
    test("should reject non-string filePath", () => {
      const result = createDoc(123, "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject empty filePath", () => {
      const result = createDoc("", "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject whitespace-only filePath", () => {
      const result = createDoc("   ", "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("filePath must be a non-empty string");
    });

    test("should reject non-string fileName", () => {
      const result = createDoc("./test", 123, "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("fileName must be a non-empty string");
    });

    test("should reject empty fileName", () => {
      const result = createDoc("./test", "", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("fileName must be a non-empty string");
    });

    test("should reject non-string content", () => {
      const result = createDoc("./test", "test.md", 123);
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("content must be a string");
    });

    test("should reject content exceeding size limit", () => {
      const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
      const result = createDoc("./test", "test.md", largeContent);
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain("Content size");
      expect(result.error).toContain("exceeds maximum allowed size");
    });

    test("should accept valid inputs", () => {
      const result = createDoc("./test", "test.md", "valid content");
      expect(result.success).toBe(true);
      expect(result.fullPath).toContain("test.md");
      expect(result.message).toContain("Document created successfully");
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
        expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
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
        expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
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
        expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
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
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain(fileName);
        expect(result.message).toContain("Document created successfully");
      });
    });

    test("should reject filenames that are too long", () => {
      const longName = "a".repeat(256) + ".md";
      const result = createDoc("./test", longName, "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.error).toContain(
        "Filename too long: maximum 255 characters allowed"
      );
    });
  });

  describe("Security Validation", () => {
    test("should reject path traversal attempts with ../", () => {
      const result = createDoc("../../../etc", "passwd", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
      expect(result.error).toContain("Security violation");
    });

    test("should reject path traversal attempts with ..\\", () => {
      const result = createDoc("..\\..\\..\\windows", "system32", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
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
        expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
        expect(result.error).toContain("Security violation");
      });
    });

    test("should accept safe relative paths", () => {
      const safePaths = ["./docs", "src/components", "test/fixtures"];

      safePaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain("test.md");
        expect(result.message).toContain("Document created successfully");
      });
    });

    test("should accept absolute paths within project directory", () => {
      const projectPath = path.resolve(process.cwd(), "docs");
      const result = createDoc(projectPath, "test.md", "content");
      expect(result.success).toBe(true);
      expect(result.fullPath).toContain("test.md");
      expect(result.message).toContain("Document created successfully");
    });

    test("should reject paths that resolve outside project boundaries", () => {
      const projectRoot = process.cwd();
      const outsidePath = path.resolve(projectRoot, "../outside-project");
      const result = createDoc(outsidePath, "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
      expect(result.error).toContain("Security violation");
    });

    test("should handle mixed path separators correctly", () => {
      const mixedPath = "docs\\\\subfolder//files";
      const result = createDoc(mixedPath, "test.md", "content");
      expect(result.success).toBe(true);
      expect(result.fullPath).toContain("test.md");
      expect(result.message).toContain("Document created successfully");
    });

    test("should resolve relative paths correctly", () => {
      const relativePaths = ["./docs", "./src/components", "test/fixtures"];

      relativePaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain("test.md");
        expect(result.message).toContain("Document created successfully");
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
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain("test.md");
        expect(result.message).toContain("Document created successfully");
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
        expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
        expect(result.error).toContain("Security violation");
      });
    });

    test("should handle current directory references safely", () => {
      const currentDirPaths = ["./docs", ".\\src", "./test/./fixtures"];

      currentDirPaths.forEach((filePath) => {
        const result = createDoc(filePath, "test.md", "content");
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain("test.md");
        expect(result.message).toContain("Document created successfully");
      });
    });

    test("should validate final file path boundaries", () => {
      // Test that even if directory is valid, final file path is checked
      const result = createDoc("docs", "../outside-file.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
      expect(result.error).toContain("Security violation");
    });
  });

  describe("Directory Management", () => {
    test("should create directories recursively", () => {
      const result = createDoc(
        "./deep/nested/directory/structure",
        "test.md",
        "content"
      );
      expect(result.success).toBe(true);
      expect(
        fs.existsSync(
          path.join(process.cwd(), "deep/nested/directory/structure")
        )
      ).toBe(true);
      expect(fs.existsSync(result.fullPath)).toBe(true);
    });

    test("should handle existing directories gracefully", () => {
      // Create directory first
      const dirPath = path.join(process.cwd(), "existing-dir");
      fs.mkdirSync(dirPath, { recursive: true });

      const result = createDoc("./existing-dir", "test.md", "content");
      expect(result.success).toBe(true);
      expect(fs.existsSync(result.fullPath)).toBe(true);
    });

    test("should work with single-level directories", () => {
      const result = createDoc("./simple", "test.md", "content");
      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "simple"))).toBe(true);
      expect(fs.existsSync(result.fullPath)).toBe(true);
    });
  });

  describe("File Operations", () => {
    test("should create new files successfully", () => {
      const content = "# Test Document\n\nThis is test content.";
      const result = createDoc("./docs", "new-file.md", content);

      expect(result.success).toBe(true);
      expect(result.fullPath).toContain("new-file.md");
      expect(result.message).toContain("Document created successfully");

      // Verify file exists and has correct content
      expect(fs.existsSync(result.fullPath)).toBe(true);
      const fileContent = fs.readFileSync(result.fullPath, "utf8");
      expect(fileContent).toBe(content);
    });

    test("should overwrite existing files", () => {
      const filePath = "./docs";
      const fileName = "overwrite-test.md";
      const originalContent = "Original content";
      const newContent = "New content";

      // Create original file
      const firstResult = createDoc(filePath, fileName, originalContent);
      expect(firstResult.success).toBe(true);

      // Overwrite with new content
      const secondResult = createDoc(filePath, fileName, newContent);
      expect(secondResult.success).toBe(true);

      // Verify content was overwritten
      const fileContent = fs.readFileSync(secondResult.fullPath, "utf8");
      expect(fileContent).toBe(newContent);
    });

    test("should handle UTF-8 content correctly", () => {
      const utf8Content = "Hello 世界! 🌍 Émojis and ñoñó characters";
      const result = createDoc("./docs", "utf8-test.md", utf8Content);

      expect(result.success).toBe(true);

      // Verify UTF-8 content is preserved
      const fileContent = fs.readFileSync(result.fullPath, "utf8");
      expect(fileContent).toBe(utf8Content);
    });

    test("should handle empty content", () => {
      const result = createDoc("./docs", "empty-file.md", "");

      expect(result.success).toBe(true);
      expect(fs.existsSync(result.fullPath)).toBe(true);

      const fileContent = fs.readFileSync(result.fullPath, "utf8");
      expect(fileContent).toBe("");
    });

    test("should handle large content within limits", () => {
      const largeContent = "x".repeat(1024 * 1024); // 1MB
      const result = createDoc("./docs", "large-file.md", largeContent);

      expect(result.success).toBe(true);
      expect(fs.existsSync(result.fullPath)).toBe(true);

      const fileContent = fs.readFileSync(result.fullPath, "utf8");
      expect(fileContent).toBe(largeContent);
    });
  });

  describe("Error Handling", () => {
    test("should categorize validation errors correctly", () => {
      const result = createDoc("", "test.md", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(result.message).toContain("user-friendly");
    });

    test("should categorize security errors correctly", () => {
      const result = createDoc("../../../etc", "passwd", "content");
      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.SECURITY_ERROR);
      expect(result.message).toContain("user-friendly");
    });

    test("should provide structured error responses", () => {
      const result = createDoc(null, "test.md", "content");

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe("string");
      expect(typeof result.message).toBe("string");
      expect(typeof result.code).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
      expect(result.message.length).toBeGreaterThan(0);
    });

    test("should handle permission errors gracefully", () => {
      // This test might be platform-specific, so we'll mock it
      const originalWriteFileSync = fs.writeFileSync;
      fs.writeFileSync = jest.fn(() => {
        const error = new Error("EACCES: permission denied");
        error.code = "EACCES";
        throw error;
      });

      const result = createDoc("./docs", "permission-test.md", "content");

      expect(result.success).toBe(false);
      expect(result.code).toBe(ERROR_TYPES.PERMISSION_ERROR);

      // Restore original function
      fs.writeFileSync = originalWriteFileSync;
    });
  });

  describe("Integration Tests", () => {
    test("should handle complete workflow with nested directories", () => {
      const content = `# Project Documentation

## Overview
This is a comprehensive test of the createDoc functionality.

## Features
- Directory auto-creation
- Security validation
- UTF-8 support
- Error handling

## Usage
\`\`\`javascript
import { createDoc } from '@whatsfresh/shared-imports/utils';
const result = createDoc('./docs', 'readme.md', content);
\`\`\`
`;

      const result = createDoc(
        "./project/docs/guides",
        "comprehensive-test.md",
        content
      );

      expect(result.success).toBe(true);
      expect(result.fullPath).toContain("comprehensive-test.md");
      expect(fs.existsSync(result.fullPath)).toBe(true);

      const fileContent = fs.readFileSync(result.fullPath, "utf8");
      expect(fileContent).toBe(content);

      // Verify directory structure was created
      expect(fs.existsSync(path.join(process.cwd(), "project"))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "project/docs"))).toBe(
        true
      );
      expect(
        fs.existsSync(path.join(process.cwd(), "project/docs/guides"))
      ).toBe(true);
    });

    test("should handle batch document creation", () => {
      const documents = [
        { path: "./batch/docs", name: "readme.md", content: "# README" },
        {
          path: "./batch/api",
          name: "endpoints.md",
          content: "# API Endpoints",
        },
        { path: "./batch/guides", name: "setup.md", content: "# Setup Guide" },
      ];

      const results = documents.map((doc) =>
        createDoc(doc.path, doc.name, doc.content)
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      expect(successful.length).toBe(3);
      expect(failed.length).toBe(0);

      // Verify all files were created
      results.forEach((result) => {
        expect(fs.existsSync(result.fullPath)).toBe(true);
      });
    });

    test("should maintain consistent behavior across multiple calls", () => {
      const basePath = "./consistency-test";
      const fileName = "test.md";
      const content = "Test content";

      // Create same file multiple times
      for (let i = 0; i < 5; i++) {
        const result = createDoc(basePath, fileName, `${content} ${i}`);
        expect(result.success).toBe(true);
        expect(result.fullPath).toContain(fileName);

        // Verify content is correct for each iteration
        const fileContent = fs.readFileSync(result.fullPath, "utf8");
        expect(fileContent).toBe(`${content} ${i}`);
      }
    });
  });

  describe("Utility Functions", () => {
    test("validateInputs should work independently", () => {
      expect(() =>
        validateInputs("./test", "file.md", "content")
      ).not.toThrow();
      expect(() => validateInputs("", "file.md", "content")).toThrow();
      expect(() => validateInputs("./test", "", "content")).toThrow();
      expect(() => validateInputs("./test", "file.md", 123)).toThrow();
    });

    test("validateFileName should work independently", () => {
      expect(() => validateFileName("valid-file.md")).not.toThrow();
      expect(() => validateFileName("invalid<file.md")).toThrow();
      expect(() => validateFileName("CON.md")).toThrow();
    });

    test("fileExists should work independently", () => {
      // Create a test file
      const testPath = path.join(process.cwd(), "exists-test.md");
      fs.writeFileSync(testPath, "test");

      expect(fileExists(testPath)).toBe(true);
      expect(fileExists(path.join(process.cwd(), "non-existent.md"))).toBe(
        false
      );
    });

    test("directoryExists should work independently", () => {
      const testDir = path.join(process.cwd(), "test-directory");
      fs.mkdirSync(testDir);

      expect(directoryExists(testDir)).toBe(true);
      expect(
        directoryExists(path.join(process.cwd(), "non-existent-dir"))
      ).toBe(false);
    });

    test("ensureDirectory should work independently", () => {
      const testDir = path.join(process.cwd(), "ensure-test/nested/deep");

      expect(() => ensureDirectory(testDir)).not.toThrow();
      expect(fs.existsSync(testDir)).toBe(true);
    });

    test("ERROR_TYPES should be properly defined", () => {
      expect(typeof ERROR_TYPES).toBe("object");
      expect(ERROR_TYPES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_TYPES.SECURITY_ERROR).toBeDefined();
      expect(ERROR_TYPES.PERMISSION_ERROR).toBeDefined();
      expect(ERROR_TYPES.DISK_ERROR).toBeDefined();
      expect(ERROR_TYPES.DIRECTORY_ERROR).toBeDefined();
      expect(ERROR_TYPES.WRITE_ERROR).toBeDefined();
    });

    test("categorizeError should work independently", () => {
      const validationError = new Error("filePath must be a non-empty string");
      const securityError = new Error(
        "Security violation: path traversal detected"
      );
      const permissionError = new Error("EACCES: permission denied");

      expect(categorizeError(validationError)).toBe(
        ERROR_TYPES.VALIDATION_ERROR
      );
      expect(categorizeError(securityError)).toBe(ERROR_TYPES.SECURITY_ERROR);
      expect(categorizeError(permissionError)).toBe(
        ERROR_TYPES.PERMISSION_ERROR
      );
    });
  });
});
