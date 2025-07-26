/**
 * File writing utilities
 */

import fs from "fs";
import createLogger from "../logger.js";

const logger = createLogger("FileWriter");

/**
 * Write content to file with UTF-8 encoding
 * @param {string} filePath - Full path to file
 * @param {string} content - Content to write
 * @throws {Error} If file writing fails
 */
export function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
    logger.debug("File written successfully", {
      filePath,
      contentLength: content.length,
    });
  } catch (error) {
    logger.error("Failed to write file", { filePath, error: error.message });

    // Provide specific error messages based on error type
    if (error.code === "EACCES") {
      throw new Error(`Permission denied: cannot write to "${filePath}"`);
    } else if (error.code === "ENOSPC") {
      throw new Error(`Disk space full: cannot write to "${filePath}"`);
    } else if (error.code === "ENOTDIR") {
      throw new Error(
        `Invalid path: directory in "${filePath}" does not exist`
      );
    } else if (error.code === "EISDIR") {
      throw new Error(
        `Invalid target: "${filePath}" is a directory, not a file`
      );
    } else {
      throw new Error(`Failed to write file "${filePath}": ${error.message}`);
    }
  }
}
