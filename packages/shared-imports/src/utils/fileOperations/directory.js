/**
 * Directory management utilities
 */

import fs from "fs";
import path from "path";
import createLogger from "../logger.js";

const logger = createLogger("DirectoryOps");

/**
 * Check if directory exists
 * @param {string} dirPath - Directory path to check
 * @returns {boolean} True if directory exists
 */
export function directoryExists(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Ensure directory exists, creating it recursively if needed
 * @param {string} dirPath - Directory path to ensure exists
 * @throws {Error} If directory creation fails
 */
export function ensureDirectory(dirPath) {
  if (directoryExists(dirPath)) {
    logger.debug("Directory already exists", { dirPath });
    return;
  }

  try {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.debug("Directory created successfully", { dirPath });
  } catch (error) {
    logger.error("Failed to create directory", {
      dirPath,
      error: error.message,
    });

    // Provide specific error messages based on error type
    if (error.code === "EACCES") {
      throw new Error(
        `Permission denied: cannot create directory "${dirPath}"`
      );
    } else if (error.code === "ENOSPC") {
      throw new Error(`Disk space full: cannot create directory "${dirPath}"`);
    } else if (error.code === "ENOTDIR") {
      throw new Error(
        `Invalid path: "${dirPath}" contains a file where directory expected`
      );
    } else {
      throw new Error(
        `Failed to create directory "${dirPath}": ${error.message}`
      );
    }
  }
}

/**
 * Get directory path from full file path
 * @param {string} fullPath - Full file path
 * @returns {string} Directory path
 */
export function getDirectoryPath(fullPath) {
  return path.dirname(fullPath);
}
