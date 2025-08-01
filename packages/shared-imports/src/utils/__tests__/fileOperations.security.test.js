/**
 * Unit tests for fileOperations security module
 * Tests path security validation and traversal prevention
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import path from "path";
import os from "os";
import { validateSecurity, resolvePath } from "../fileOperations/security.js";

// Test directory setup
const TEST_DIR = path.join(os.tmpdir(), "security-test-" + Date.now());
const ORIGINAL_CWD = process.cwd();

describe("fileOperations.security", () => {
  beforeEach(() => {
    // Create test directory and change to it
    if (!require("fs").existsSync(TEST_DIR)) {
      require("fs").mkdirSync(TEST_DIR, { recursive: true });
    }
    process.chdir(TEST_DIR);
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(ORIGINAL_CWD);
    // Clean up test directory
    if (require("fs").existsSync(TEST_DIR)) {
      require("fs").rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("validateSecurity", () => {
    test("should accept safe relative paths", () => {
      const safePaths = [
        ["./docs", "file.md"],
        ["src/components", "component.jsx"],
        ["test/fixtures", "data.json"],
        [".", "readme.md"],
        ["nested/deep/path", "file.txt"],
      ];

      safePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });

    test("should accept absolute paths within project directory", () => {
      const projectPath = path.resolve(process.cwd(), "docs");
      const result = validateSecurity(projectPath, "file.md");
      expect(typeof result).toBe("string");
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain("file.md");
    });

    test("should reject path traversal attempts with ../", () => {
      const maliciousPaths = [
        ["../../../etc", "passwd"],
        ["../outside", "file.md"],
        ["./../../etc", "hosts"],
        ["docs/../../../etc", "passwd"],
      ];

      maliciousPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).toThrow(
          /Security violation.*path traversal/
        );
      });
    });

    test("should reject path traversal attempts with ..\\", () => {
      const maliciousPaths = [
        ["..\\..\\..\\windows", "system32"],
        ["..\\outside", "file.md"],
        [".\\..\\..\\etc", "hosts"],
        ["docs\\..\\..\\..\\etc", "passwd"],
      ];

      maliciousPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).toThrow(
          /Security violation.*path traversal/
        );
      });
    });

    test("should reject paths that resolve outside project boundaries", () => {
      const projectRoot = process.cwd();
      const outsidePaths = [
        [path.resolve(projectRoot, "../outside-project"), "file.md"],
        [path.resolve(projectRoot, "../../etc"), "passwd"],
        ["/etc", "passwd"],
        ["/tmp", "file.md"],
      ];

      outsidePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).toThrow(
          /Security violation.*outside project directory/
        );
      });
    });

    test("should handle mixed path separators correctly", () => {
      const mixedPaths = [
        ["docs\\\\subfolder//files", "file.md"],
        ["src/components\\ui//buttons", "button.jsx"],
        ["test\\fixtures/data", "sample.json"],
      ];

      mixedPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });

    test("should handle current directory references safely", () => {
      const currentDirPaths = [
        ["./docs", "file.md"],
        [".\\src", "file.js"],
        ["./test/./fixtures", "data.json"],
        ["./././docs", "readme.md"],
      ];

      currentDirPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });

    test("should validate final file path boundaries", () => {
      // Test that even if directory is valid, final file path is checked
      expect(() => validateSecurity("docs", "../outside-file.md")).toThrow(
        /Security violation.*path traversal/
      );
      expect(() => validateSecurity("valid/path", "../../outside.md")).toThrow(
        /Security violation.*path traversal/
      );
    });

    test("should reject paths with parent references in middle", () => {
      const maliciousPaths = [
        ["docs/../../../etc", "passwd"],
        ["src/components/../../../../../../etc", "hosts"],
        ["valid/path/../../../outside", "file.md"],
        ["nested/deep/../../../../../../../etc", "passwd"],
      ];

      maliciousPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).toThrow(
          /Security violation.*path traversal/
        );
      });
    });

    test("should handle nested directory paths correctly", () => {
      const nestedPaths = [
        ["docs/guides/setup", "installation.md"],
        ["src/components/ui/buttons", "button.jsx"],
        ["test/fixtures/data/samples", "sample.json"],
        ["very/deeply/nested/directory/structure", "file.txt"],
      ];

      nestedPaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
        expect(result).toContain(fileName);
      });
    });

    test("should handle edge cases", () => {
      // Root directory access
      expect(() => validateSecurity(".", "file.md")).not.toThrow();

      // Single level directory
      expect(() => validateSecurity("docs", "file.md")).not.toThrow();

      // Empty relative path components
      expect(() =>
        validateSecurity("docs//subfolder", "file.md")
      ).not.toThrow();
    });

    test("should preserve filename in final path", () => {
      const testCases = [
        ["./docs", "readme.md"],
        ["src/components", "button.jsx"],
        ["test", "sample.json"],
      ];

      testCases.forEach(([filePath, fileName]) => {
        const result = validateSecurity(filePath, fileName);
        expect(result).toContain(fileName);
        expect(path.basename(result)).toBe(fileName);
      });
    });
  });

  describe("resolvePath", () => {
    test("should resolve relative paths correctly", () => {
      const relativePaths = ["./docs", "src/components", "test/fixtures", "."];

      relativePaths.forEach((filePath) => {
        const result = resolvePath(filePath);
        expect(typeof result).toBe("object");
        expect(typeof result.resolved).toBe("string");
        expect(typeof result.normalized).toBe("string");
        expect(path.isAbsolute(result.resolved)).toBe(true);
      });
    });

    test("should resolve absolute paths correctly", () => {
      const absolutePath = path.resolve(process.cwd(), "docs");
      const result = resolvePath(absolutePath);

      expect(typeof result).toBe("object");
      expect(typeof result.resolved).toBe("string");
      expect(typeof result.normalized).toBe("string");
      expect(path.isAbsolute(result.resolved)).toBe(true);
      expect(result.resolved).toBe(absolutePath);
    });

    test("should normalize path separators", () => {
      const mixedPath = "docs\\\\subfolder//files";
      const result = resolvePath(mixedPath);

      expect(result.normalized).not.toContain("\\\\");
      expect(result.normalized).not.toContain("//");
      expect(path.isAbsolute(result.resolved)).toBe(true);
    });

    test("should handle current directory references", () => {
      const currentDirPaths = ["./docs", "./././docs", "docs/./subfolder"];

      currentDirPaths.forEach((filePath) => {
        const result = resolvePath(filePath);
        expect(typeof result).toBe("object");
        expect(path.isAbsolute(result.resolved)).toBe(true);
        expect(result.normalized).not.toContain("/./");
        expect(result.normalized).not.toContain("\\.\\");
      });
    });

    test("should provide both resolved and normalized paths", () => {
      const result = resolvePath("./docs/subfolder");

      expect(result).toHaveProperty("resolved");
      expect(result).toHaveProperty("normalized");
      expect(typeof result.resolved).toBe("string");
      expect(typeof result.normalized).toBe("string");
      expect(path.isAbsolute(result.resolved)).toBe(true);
    });
  });

  describe("Security Edge Cases", () => {
    test("should handle Unicode and special characters in paths", () => {
      const unicodePaths = [
        ["./docs/ñoñó", "file.md"],
        ["./测试/文档", "test.txt"],
        ["./docs/émojis🌍", "readme.md"],
      ];

      unicodePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });

    test("should handle very long paths within limits", () => {
      const longPath = "a".repeat(100) + "/" + "b".repeat(100);
      expect(() => validateSecurity(longPath, "file.md")).not.toThrow();
    });

    test("should handle paths with spaces", () => {
      const spacePaths = [
        ["./docs with spaces", "file.md"],
        ["./my documents/projects", "readme.txt"],
        ["./folder name/sub folder", "data.json"],
      ];

      spacePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });

    test("should reject null bytes in paths", () => {
      const nullBytePaths = [
        ["./docs\0", "file.md"],
        ["./docs", "file\0.md"],
        ["./docs/sub\0folder", "file.md"],
      ];

      nullBytePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).toThrow(
          /Security violation.*path traversal/
        );
      });
    });

    test("should handle case sensitivity correctly", () => {
      const casePaths = [
        ["./DOCS", "FILE.MD"],
        ["./Docs/SubFolder", "ReadMe.txt"],
        ["./src/Components", "Button.jsx"],
      ];

      casePaths.forEach(([filePath, fileName]) => {
        expect(() => validateSecurity(filePath, fileName)).not.toThrow();
        const result = validateSecurity(filePath, fileName);
        expect(typeof result).toBe("string");
        expect(path.isAbsolute(result)).toBe(true);
      });
    });
  });
});
