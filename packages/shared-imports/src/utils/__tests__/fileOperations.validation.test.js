/**
 * Unit tests for fileOperations validation module
 * Tests input validation and filename validation functions
 */

import { describe, test, expect } from "@jest/globals";
import {
  validateInputs,
  validateFileName,
} from "../fileOperations/validation.js";

describe("fileOperations.validation", () => {
  describe("validateInputs", () => {
    test("should accept valid inputs", () => {
      expect(() =>
        validateInputs("./test", "file.md", "content")
      ).not.toThrow();
      expect(() =>
        validateInputs("/absolute/path", "file.txt", "")
      ).not.toThrow();
      expect(() =>
        validateInputs("relative/path", "file.json", "{}")
      ).not.toThrow();
    });

    test("should reject non-string filePath", () => {
      expect(() => validateInputs(123, "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs(null, "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs(undefined, "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs([], "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs({}, "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
    });

    test("should reject empty or whitespace-only filePath", () => {
      expect(() => validateInputs("", "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs("   ", "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
      expect(() => validateInputs("\t\n", "file.md", "content")).toThrow(
        "filePath must be a non-empty string"
      );
    });

    test("should reject non-string fileName", () => {
      expect(() => validateInputs("./test", 123, "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", null, "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", undefined, "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", [], "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", {}, "content")).toThrow(
        "fileName must be a non-empty string"
      );
    });

    test("should reject empty or whitespace-only fileName", () => {
      expect(() => validateInputs("./test", "", "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", "   ", "content")).toThrow(
        "fileName must be a non-empty string"
      );
      expect(() => validateInputs("./test", "\t\n", "content")).toThrow(
        "fileName must be a non-empty string"
      );
    });

    test("should reject non-string content", () => {
      expect(() => validateInputs("./test", "file.md", 123)).toThrow(
        "content must be a string"
      );
      expect(() => validateInputs("./test", "file.md", null)).toThrow(
        "content must be a string"
      );
      expect(() => validateInputs("./test", "file.md", undefined)).toThrow(
        "content must be a string"
      );
      expect(() => validateInputs("./test", "file.md", [])).toThrow(
        "content must be a string"
      );
      expect(() => validateInputs("./test", "file.md", {})).toThrow(
        "content must be a string"
      );
    });

    test("should reject content exceeding size limit", () => {
      const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
      expect(() => validateInputs("./test", "file.md", largeContent)).toThrow(
        /Content size.*exceeds maximum allowed size/
      );
    });

    test("should accept content at size limit", () => {
      const maxContent = "x".repeat(10 * 1024 * 1024); // 10MB exactly
      expect(() =>
        validateInputs("./test", "file.md", maxContent)
      ).not.toThrow();
    });

    test("should accept empty content", () => {
      expect(() => validateInputs("./test", "file.md", "")).not.toThrow();
    });
  });

  describe("validateFileName", () => {
    test("should accept valid filenames", () => {
      const validNames = [
        "file.md",
        "my-file.txt",
        "my_file.json",
        "file123.js",
        "component.jsx",
        "style.css",
        "data.yml",
        "config.yaml",
        "test.spec.js",
        "file-name_with.dots.md",
        "a.b",
        "123.txt",
      ];

      validNames.forEach((fileName) => {
        expect(() => validateFileName(fileName)).not.toThrow();
      });
    });

    test("should reject filenames with invalid characters", () => {
      const invalidNames = [
        "file<name.md",
        "file>name.md",
        "file|name.md",
        "file:name.md",
        "file*name.md",
        "file?name.md",
        'file"name.md',
        "file\\name.md",
        "file/name.md",
        "file\0name.md",
        "file\tname.md",
        "file\nname.md",
      ];

      invalidNames.forEach((fileName) => {
        expect(() => validateFileName(fileName)).toThrow(
          "Invalid filename: only alphanumeric characters, dashes, underscores, and dots are allowed"
        );
      });
    });

    test("should reject reserved system names (case insensitive)", () => {
      const reservedNames = [
        "CON.md",
        "con.txt",
        "Con.js",
        "PRN.md",
        "prn.txt",
        "Prn.js",
        "AUX.md",
        "aux.txt",
        "Aux.js",
        "NUL.md",
        "nul.txt",
        "Nul.js",
        "COM1.md",
        "com1.txt",
        "Com1.js",
        "COM2.md",
        "com9.txt",
        "LPT1.md",
        "lpt1.txt",
        "Lpt1.js",
        "LPT2.md",
        "lpt9.txt",
      ];

      reservedNames.forEach((fileName) => {
        expect(() => validateFileName(fileName)).toThrow(
          /is a reserved system name/
        );
      });
    });

    test("should reject disallowed file extensions", () => {
      const disallowedFiles = [
        "file.exe",
        "file.bat",
        "file.com",
        "file.scr",
        "file.vbs",
        "file.cmd",
        "file.pif",
        "file.msi",
      ];

      disallowedFiles.forEach((fileName) => {
        expect(() => validateFileName(fileName)).toThrow(
          "Invalid file extension"
        );
      });
    });

    test("should reject filenames that are too long", () => {
      const longName = "a".repeat(256) + ".md";
      expect(() => validateFileName(longName)).toThrow(
        "Filename too long: maximum 255 characters allowed"
      );
    });

    test("should accept filenames at maximum length", () => {
      const maxLengthName = "a".repeat(251) + ".md"; // 255 characters total
      expect(() => validateFileName(maxLengthName)).not.toThrow();
    });

    test("should reject filenames without extensions", () => {
      expect(() => validateFileName("filename")).toThrow(
        "Invalid filename: file must have an extension"
      );
    });

    test("should reject filenames starting with dots", () => {
      expect(() => validateFileName(".hidden")).toThrow(
        "Invalid filename: file must have an extension"
      );
      expect(() => validateFileName("..")).toThrow(
        "Invalid filename: file must have an extension"
      );
    });

    test("should accept filenames with multiple dots", () => {
      expect(() => validateFileName("file.test.md")).not.toThrow();
      expect(() => validateFileName("component.spec.js")).not.toThrow();
    });

    test("should handle edge cases", () => {
      // Single character filename with extension
      expect(() => validateFileName("a.md")).not.toThrow();

      // Filename with numbers only
      expect(() => validateFileName("123.txt")).not.toThrow();

      // Filename with mixed case
      expect(() => validateFileName("MyFile.MD")).not.toThrow();
    });
  });
});
