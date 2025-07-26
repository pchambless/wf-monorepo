/**
 * File backup utilities
 */

import fs from "fs";
import path from "path";
import createLogger from "../logger.js";

const logger = createLogger("FileBackup");

/**
 * Check if file exists
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file exists
 */
export function fileExists(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Generate backup filename with timestamp
 * @param {string} originalPath - Original file path
 * @returns {string} Backup file path
 */
export function generateBackupPath(originalPath) {
  const timestamp = Date.now();
  const ext = path.extname(originalPath);
  const nameWithoutExt = path.basename(originalPath, ext);
  const dir = path.dirname(originalPath);

  return path.join(dir, `${nameWithoutExt}.backup.${timestamp}${ext}`);
}

/**
 * Create backup of existing file
 * @param {string} filePath - Path to file to backup
 * @returns {string|null} Path to backup file, or null if no backup needed
 * @throws {Error} If backup creation fails
 */
export function createBackup(filePath) {
  if (!fileExists(filePath)) {
    logger.debug("No backup needed - file does not exist", { filePath });
    return null;
  }

  const backupPath = generateBackupPath(filePath);

  try {
    fs.copyFileSync(filePath, backupPath);
    logger.debug("Backup created successfully", {
      originalPath: filePath,
      backupPath,
    });
    return backupPath;
  } catch (error) {
    logger.error("Failed to create backup", {
      filePath,
      backupPath,
      error: error.message,
    });

    // Provide specific error messages based on error type
    if (error.code === "EACCES") {
      throw new Error(
        `Permission denied: cannot create backup of "${filePath}"`
      );
    } else if (error.code === "ENOSPC") {
      throw new Error(`Disk space full: cannot create backup of "${filePath}"`);
    } else if (error.code === "ENOENT") {
      throw new Error(`File not found: cannot backup "${filePath}"`);
    } else {
      throw new Error(
        `Failed to create backup of "${filePath}": ${error.message}`
      );
    }
  }
}
