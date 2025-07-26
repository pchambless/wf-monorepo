/**
 * Input and filename validation utilities
 */

import path from "path";
import createLogger from "../logger.js";

const logger = createLogger("FileValidation");

// Security constraints
export const SECURITY_CONSTRAINTS = {
  allowedFileNamePattern: /^[a-zA-Z0-9\-_\.]+$/,
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
  allowedExtensions: [
    ".md",
    ".txt",
    ".json",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".html",
    ".css",
    ".yml",
    ".yaml",
  ],
};

/**
 * Validate input parameters for createDoc function
 * @param {string} filePath - Directory path to validate
 * @param {string} fileName - File name to validate
 * @param {string} content - Content to validate
 * @throws {Error} If validation fails
 */
export function validateInputs(filePath, fileName, content) {
  // Check if all required parameters are provided
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new Error("filePath must be a non-empty string");
  }

  if (typeof fileName !== "string" || fileName.trim() === "") {
    throw new Error("fileName must be a non-empty string");
  }

  if (typeof content !== "string") {
    throw new Error("content must be a string");
  }

  // Validate file size
  const contentSize = Buffer.byteLength(content, "utf8");
  if (contentSize > SECURITY_CONSTRAINTS.maxFileSize) {
    throw new Error(
      `Content size (${contentSize} bytes) exceeds maximum allowed size (${SECURITY_CONSTRAINTS.maxFileSize} bytes)`
    );
  }

  logger.debug("Input validation passed", {
    filePath: filePath.trim(),
    fileName: fileName.trim(),
    contentSize,
  });
}

/**
 * Validate filename against security constraints
 * @param {string} fileName - File name to validate
 * @throws {Error} If filename validation fails
 */
export function validateFileName(fileName) {
  const trimmedName = fileName.trim();

  // Check filename pattern (alphanumeric, dash, underscore, dot only)
  if (!SECURITY_CONSTRAINTS.allowedFileNamePattern.test(trimmedName)) {
    throw new Error(
      "Invalid filename: only alphanumeric characters, dashes, underscores, and dots are allowed"
    );
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];
  const nameWithoutExt = path.parse(trimmedName).name.toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    throw new Error(
      `Invalid filename: "${trimmedName}" is a reserved system name`
    );
  }

  // Check file extension if present
  const ext = path.extname(trimmedName).toLowerCase();
  if (ext && !SECURITY_CONSTRAINTS.allowedExtensions.includes(ext)) {
    throw new Error(
      `Invalid file extension: "${ext}" is not allowed. Allowed extensions: ${SECURITY_CONSTRAINTS.allowedExtensions.join(
        ", "
      )}`
    );
  }

  // Check filename length
  if (trimmedName.length > 255) {
    throw new Error("Filename too long: maximum 255 characters allowed");
  }

  logger.debug("Filename validation passed", {
    fileName: trimmedName,
    extension: ext,
  });
}
