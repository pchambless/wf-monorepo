/**
 * Simple File Writing Controller with Automatic Impact Tracking
 * Bypass complex path resolution - just write content to specified location
 * Enhanced with automatic impact tracking for all file operations
 */

import fs from "fs/promises";
import path from "path";
import logger from "../utils/logger.js";
import { trackFileChange } from "../workflows/impact-tracking/index.js";

const codeName = `[writeFileDirectly.js]`;

/**
 * Simple file writing endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const writeFileDirectly = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { filePath, content } = req.body;

  try {
    // Validate required parameters
    if (!filePath || content === undefined) {
      return res.status(400).json({
        error: "MISSING_PARAMETERS",
        message: "filePath and content are required",
      });
    }

    // Check if file exists to determine change type
    let changeType = "CREATE";
    let wasOverwrite = false;
    try {
      await fs.access(filePath);
      changeType = "MODIFY";
      wasOverwrite = true;
    } catch {
      // File doesn't exist, it's a CREATE operation
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, "utf8");

    const result = {
      success: true,
      filePath: filePath,
      message: `File written successfully: ${filePath}`,
      wasOverwrite: wasOverwrite,
      changeType: changeType,
    };

    // Track impact automatically (async, don't block response)
    trackFileChange(filePath, changeType, {
      operation: "writeFileDirectly",
      contentLength: content.length,
      wasOverwrite: wasOverwrite,
      userID: req.body.userID || req.headers["x-user-id"] || "api-user",
    }).catch((error) => {
      logger.warn(
        `${codeName} Impact tracking failed for ${filePath}:`,
        error.message
      );
    });

    logger.info(
      `${codeName} File written successfully: ${filePath} (${changeType})`
    );
    res.json(result);
  } catch (error) {
    logger.error(`${codeName} Error writing file:`, error);

    res.status(500).json({
      error: "FILE_WRITE_FAILED",
      message: error.message,
      filePath,
    });
  }
};

export default writeFileDirectly;
