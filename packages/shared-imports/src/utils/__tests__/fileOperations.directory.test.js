/**
 * Unit tests for fileOperations directory module
 * Tests directory creation and management functions
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import path from "path";
import fs from "fs";
import os from "os";
import {
  ensureDirectory,
  directoryExists,
  getDirectoryPath,
} from "../fileOperations/directory.js";

// Test directory setup
const TEST_DIR = path.join(os.tmpdir(), "directory-test-" + Date.now());
const ORIGINAL_CWD = process.cwd();

describe("fileOperations.directory", () => {
  beforeEach(() => {
    // Create test directory and change to it
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
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

  describe("directoryExists", () => {
    test("should return true for existing directories", () => {
      const testDir = path.join(process.cwd(), "existing-dir");
      fs.mkdirSync(testDir);

      expect(directoryExists(testDir)).toBe(true);
    });

    test("should return false for non-existing directories", () => {
      const nonExistentDir = path.join(process.cwd(), "non-existent-dir");
      expect(directoryExists(nonExistentDir)).toBe(false);
    });

    test("should return false for files (not directories)", () => {
      const testFile = path.join(process.cwd(), "test-file.txt");
      fs.writeFileSync(testFile, "test content");

      expect(directoryExists(testFile)).toBe(false);
    });

    test("should handle absolute paths", () => {
      const absoluteDir = path.resolve(process.cwd(), "absolute-test");
      fs.mkdirSync(absoluteDir);

      expect(directoryExists(absoluteDir)).toBe(true);
    });

    test("should handle relative paths", () => {
      const relativeDir = "./relative-test";
      fs.mkdirSync(relativeDir);

      expect(directoryExists(relativeDir)).toBe(true);
    });

    test("should handle current directory", () => {
      expect(directoryExists(".")).toBe(true);
      expect(directoryExists(process.cwd())).toBe(true);
    });

    test("should handle nested paths", () => {
      const nestedDir = path.join(process.cwd(), "nested/deep/directory");
      fs.mkdirSync(nestedDir, { recursive: true });

      expect(directoryExists(nestedDir)).toBe(true);
      expect(directoryExists(path.join(process.cwd(), "nested"))).toBe(true);
      expect(directoryExists(path.join(process.cwd(), "nested/deep"))).toBe(
        true
      );
    });

    test("should handle paths with spaces", () => {
      const spaceDir = path.join(process.cwd(), "directory with spaces");
      fs.mkdirSync(spaceDir);

      expect(directoryExists(spaceDir)).toBe(true);
    });

    test("should handle Unicode characters in paths", () => {
      const unicodeDir = path.join(process.cwd(), "测试目录");
      fs.mkdirSync(unicodeDir);

      expect(directoryExists(unicodeDir)).toBe(true);
    });
  });

  describe("ensureDirectory", () => {
    test("should create single-level directory", () => {
      const singleDir = path.join(process.cwd(), "single-level");

      expect(() => ensureDirectory(singleDir)).not.toThrow();
      expect(fs.existsSync(singleDir)).toBe(true);
      expect(fs.statSync(singleDir).isDirectory()).toBe(true);
    });

    test("should create nested directories recursively", () => {
      const nestedDir = path.join(
        process.cwd(),
        "deep/nested/directory/structure"
      );

      expect(() => ensureDirectory(nestedDir)).not.toThrow();
      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.statSync(nestedDir).isDirectory()).toBe(true);

      // Verify all parent directories were created
      expect(fs.existsSync(path.join(process.cwd(), "deep"))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "deep/nested"))).toBe(true);
      expect(
        fs.existsSync(path.join(process.cwd(), "deep/nested/directory"))
      ).toBe(true);
    });

    test("should handle existing directories gracefully", () => {
      const existingDir = path.join(process.cwd(), "existing-directory");
      fs.mkdirSync(existingDir);

      expect(() => ensureDirectory(existingDir)).not.toThrow();
      expect(fs.existsSync(existingDir)).toBe(true);
      expect(fs.statSync(existingDir).isDirectory()).toBe(true);
    });

    test("should handle partially existing directory paths", () => {
      const baseDir = path.join(process.cwd(), "base");
      fs.mkdirSync(baseDir);

      const fullPath = path.join(baseDir, "new/nested/directories");

      expect(() => ensureDirectory(fullPath)).not.toThrow();
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isDirectory()).toBe(true);
    });

    test("should handle relative paths", () => {
      const relativeDir = "./relative/nested/path";

      expect(() => ensureDirectory(relativeDir)).not.toThrow();
      expect(fs.existsSync(relativeDir)).toBe(true);
      expect(fs.statSync(relativeDir).isDirectory()).toBe(true);
    });

    test("should handle absolute paths", () => {
      const absoluteDir = path.resolve(process.cwd(), "absolute/nested/path");

      expect(() => ensureDirectory(absoluteDir)).not.toThrow();
      expect(fs.existsSync(absoluteDir)).toBe(true);
      expect(fs.statSync(absoluteDir).isDirectory()).toBe(true);
    });

    test("should handle paths with spaces", () => {
      const spaceDir = path.join(
        process.cwd(),
        "directory with spaces/nested path"
      );

      expect(() => ensureDirectory(spaceDir)).not.toThrow();
      expect(fs.existsSync(spaceDir)).toBe(true);
      expect(fs.statSync(spaceDir).isDirectory()).toBe(true);
    });

    test("should handle Unicode characters in paths", () => {
      const unicodeDir = path.join(process.cwd(), "测试目录/嵌套路径");

      expect(() => ensureDirectory(unicodeDir)).not.toThrow();
      expect(fs.existsSync(unicodeDir)).toBe(true);
      expect(fs.statSync(unicodeDir).isDirectory()).toBe(true);
    });

    test("should handle current directory", () => {
      expect(() => ensureDirectory(".")).not.toThrow();
      expect(() => ensureDirectory(process.cwd())).not.toThrow();
    });

    test("should handle very deep nesting", () => {
      const deepPath = Array(20).fill("level").join("/");
      const fullPath = path.join(process.cwd(), deepPath);

      expect(() => ensureDirectory(fullPath)).not.toThrow();
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isDirectory()).toBe(true);
    });

    test("should throw error when trying to create directory over existing file", () => {
      const filePath = path.join(process.cwd(), "existing-file.txt");
      fs.writeFileSync(filePath, "test content");

      expect(() => ensureDirectory(filePath)).toThrow();
    });

    test("should throw error when parent is a file", () => {
      const filePath = path.join(process.cwd(), "parent-file.txt");
      fs.writeFileSync(filePath, "test content");

      const dirPath = path.join(filePath, "child-directory");
      expect(() => ensureDirectory(dirPath)).toThrow();
    });

    test("should handle mixed path separators", () => {
      const mixedPath = path.join(process.cwd(), "mixed\\\\separators//path");

      expect(() => ensureDirectory(mixedPath)).not.toThrow();
      expect(fs.existsSync(mixedPath)).toBe(true);
      expect(fs.statSync(mixedPath).isDirectory()).toBe(true);
    });
  });

  describe("getDirectoryPath", () => {
    test("should extract directory from file path", () => {
      const filePath = "/path/to/directory/file.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/path/to/directory");
    });

    test("should handle relative file paths", () => {
      const filePath = "./docs/guides/file.md";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("./docs/guides");
    });

    test("should handle file in current directory", () => {
      const filePath = "file.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe(".");
    });

    test("should handle absolute file paths", () => {
      const filePath = path.resolve(process.cwd(), "docs/file.md");
      const result = getDirectoryPath(filePath);

      expect(result).toBe(path.resolve(process.cwd(), "docs"));
    });

    test("should handle paths with multiple extensions", () => {
      const filePath = "/path/to/file.test.js";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/path/to");
    });

    test("should handle paths with spaces", () => {
      const filePath = "/path with spaces/to directory/file name.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/path with spaces/to directory");
    });

    test("should handle Unicode characters", () => {
      const filePath = "/测试路径/文档/文件.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/测试路径/文档");
    });

    test("should handle Windows-style paths", () => {
      const filePath = "C:\\Users\\Documents\\file.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("C:\\Users\\Documents");
    });

    test("should handle mixed path separators", () => {
      const filePath = "path\\to/mixed\\separators/file.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("path\\to/mixed\\separators");
    });

    test("should handle root directory files", () => {
      const filePath = "/file.txt";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/");
    });

    test("should handle files with no extension", () => {
      const filePath = "/path/to/filename";
      const result = getDirectoryPath(filePath);

      expect(result).toBe("/path/to");
    });
  });

  describe("Integration Tests", () => {
    test("should work together for complete directory workflow", () => {
      const testPath = path.join(process.cwd(), "integration/test/deep/nested");
      const filePath = path.join(testPath, "test-file.md");

      // Test getDirectoryPath
      const dirPath = getDirectoryPath(filePath);
      expect(dirPath).toBe(testPath);

      // Test directoryExists (should be false initially)
      expect(directoryExists(dirPath)).toBe(false);

      // Test ensureDirectory
      expect(() => ensureDirectory(dirPath)).not.toThrow();

      // Test directoryExists (should be true after creation)
      expect(directoryExists(dirPath)).toBe(true);

      // Verify the directory structure
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    test("should handle concurrent directory creation", () => {
      const basePath = path.join(process.cwd(), "concurrent");
      const paths = [
        path.join(basePath, "dir1/nested"),
        path.join(basePath, "dir2/nested"),
        path.join(basePath, "dir3/nested"),
        path.join(basePath, "shared/dir1"),
        path.join(basePath, "shared/dir2"),
      ];

      // Create all directories
      paths.forEach((dirPath) => {
        expect(() => ensureDirectory(dirPath)).not.toThrow();
      });

      // Verify all directories exist
      paths.forEach((dirPath) => {
        expect(directoryExists(dirPath)).toBe(true);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test("should handle edge cases in directory operations", () => {
      // Test with empty string (should handle gracefully)
      expect(() => getDirectoryPath("")).not.toThrow();

      // Test with just filename
      expect(getDirectoryPath("filename.txt")).toBe(".");

      // Test with directory path ending in separator
      const dirWithSeparator = path.join(process.cwd(), "test-dir") + path.sep;
      expect(() => ensureDirectory(dirWithSeparator)).not.toThrow();
      expect(directoryExists(dirWithSeparator)).toBe(true);
    });
  });
});
