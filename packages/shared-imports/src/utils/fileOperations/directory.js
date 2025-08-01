/**
 * Directory management utilities
 */

import createLogger from "../logger.js";

const logger = createLogger("DirectoryOps");
const isBrowser = typeof window !== 'undefined';

// Dynamic imports to avoid webpack bundling issues
async function getNodeModules() {
  if (isBrowser) {
    throw new Error('File operations not supported in browser environment');
  }
  const fs = await import("fs");
  const path = await import("path");
  return { fs, path };
}

/**
 * Check if directory exists
 * @param {string} dirPath - Directory path to check
 * @returns {boolean} True if directory exists
 */
export function directoryExists(dirPath) {
  if (isBrowser) {
    logger.error('directoryExists called in browser environment');
    return false;
  }
  
  try {
    // Use require for synchronous import in Node.js
    const fs = require("fs");
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
