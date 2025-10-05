/**
 * getDoc Controller
 * Simple file reading API for Studio load functionality
 */

import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

const codeName = `[getDoc.js]`;

/**
 * Get document content API endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoc = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { path: filePath } = req.query;

  try {
    // Validate required parameters
    if (!filePath) {
      return res.status(400).json({
        error: "MISSING_PARAMETERS",
        message: "path parameter is required",
      });
    }

    // Resolve path relative to workspace root (same logic as createDoc)
    let projectRoot = process.cwd();
    if (
      projectRoot.endsWith("apps/wf-server") ||
      projectRoot.endsWith("apps\\wf-server")
    ) {
      projectRoot = path.resolve(projectRoot, "../..");
    }

    const fullPath = path.resolve(projectRoot, filePath);

    // Security check - ensure path is within project
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({
        error: "SECURITY_ERROR",
        message: "Access denied: path outside project directory",
      });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        error: "FILE_NOT_FOUND",
        message: `File not found: ${filePath}`,
      });
    }

    // Read and return file content
    const content = fs.readFileSync(fullPath, "utf8");
    
    // Determine if file should be parsed as JSON or returned as raw text
    const fileExtension = path.extname(fullPath).toLowerCase();
    
    if (fileExtension === '.json') {
      // Parse JSON files
      const parsedContent = JSON.parse(content);
      logger.info(`${codeName} JSON file read successfully:`, {
        filePath,
        fullPath,
        contentLength: content.length,
      });
      res.json(parsedContent);
    } else {
      // Return raw content for non-JSON files (like .js eventType files)
      logger.info(`${codeName} Text file read successfully:`, {
        filePath,
        fullPath,
        fileExtension,
        contentLength: content.length,
      });
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    }
  } catch (error) {
    logger.error(`${codeName} Error reading file:`, error);

    if (error instanceof SyntaxError) {
      res.status(400).json({
        error: "INVALID_JSON",
        message: `Invalid JSON in file: ${error.message}`,
      });
    } else {
      res.status(500).json({
        error: "READ_ERROR",
        message: error.message,
      });
    }
  }
};

export default getDoc;
