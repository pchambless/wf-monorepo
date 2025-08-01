/**
 * File Operations with Automatic Impact Tracking
 *
 * Enhanced version of file operations that automatically tracks impacts
 * Part of automatic-impact-tracking spec - Task 3.1
 */

import { createDoc as originalCreateDoc } from "./index.js";
import { withImpactTracking } from "./impactTracking.js";
import createLogger from "../logger.js";

const logger = createLogger("FileOperationsWithTracking");

/**
 * Enhanced createDoc function with automatic impact tracking
 *
 * This function wraps the original createDoc with automatic impact tracking.
 * It maintains the same API but adds impact records to the database.
 *
 * @param {string} filePath - Directory path (relative or absolute)
 * @param {string} fileName - File name with extension
 * @param {string} content - File content to write
 * @returns {CreateDocResponse} Response object with success status and details
 */
export const createDoc = withImpactTracking(
  originalCreateDoc,
  "CREATE",
  "createDoc"
);

/**
 * Enhanced createDoc function that explicitly handles file modifications
 *
 * This is the same as createDoc but tracks as MODIFY when overwriting existing files
 *
 * @param {string} filePath - Directory path (relative or absolute)
 * @param {string} fileName - File name with extension
 * @param {string} content - File content to write
 * @returns {CreateDocResponse} Response object with success status and details
 */
export const modifyDoc = async function (filePath, fileName, content) {
  // Check if file exists first to determine change type
  const { fileExists } = await import("./backup.js");
  const { validateSecurity } = await import("./security.js");

  try {
    const fullPath = validateSecurity(filePath, fileName);
    const exists = fileExists(fullPath);
    const changeType = exists ? "MODIFY" : "CREATE";

    // Use the appropriate tracking wrapper
    const trackedFunction = withImpactTracking(
      originalCreateDoc,
      changeType,
      "modifyDoc"
    );
    return await trackedFunction(filePath, fileName, content);
  } catch (error) {
    // Fallback to CREATE if we can't determine
    const trackedFunction = withImpactTracking(
      originalCreateDoc,
      "CREATE",
      "modifyDoc"
    );
    return await trackedFunction(filePath, fileName, content);
  }
};

/**
 * Batch create multiple documents with impact tracking
 *
 * @param {Array} documents - Array of {filePath, fileName, content} objects
 * @param {string} batchDescription - Description for batch operation
 * @returns {Array} Array of results for each document
 */
export const createDocBatch = async function (
  documents,
  batchDescription = null
) {
  const { startBatch, commitBatch } = await import(
    "../../architecture/workflows/impact-tracking/index.js"
  );

  let results = [];

  try {
    // Start batch if description provided
    if (batchDescription) {
      startBatch(batchDescription);
      logger.info(`Started batch document creation: ${batchDescription}`);
    }

    // Process each document
    for (const doc of documents) {
      try {
        const result = await createDoc(doc.filePath, doc.fileName, doc.content);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          message: `Failed to create ${doc.fileName}: ${error.message}`,
          filePath: doc.filePath,
          fileName: doc.fileName,
        });
      }
    }

    // Commit batch if we started one
    if (batchDescription) {
      await commitBatch();
      logger.info(`Completed batch document creation: ${batchDescription}`);
    }
  } catch (error) {
    logger.error("Batch document creation failed", {
      error: error.message,
      batchDescription,
    });

    // Cancel batch on error
    if (batchDescription) {
      const { cancelBatch } = await import(
        "../../architecture/workflows/impact-tracking/index.js"
      );
      cancelBatch();
    }

    throw error;
  }

  return results;
};

// Re-export all the utilities from the original module
export {
  validateInputs,
  validateFileName,
  validateSecurity,
  resolvePath,
  ensureDirectory,
  directoryExists,
  createBackup,
  fileExists,
  writeFile,
  ERROR_TYPES,
  categorizeError,
} from "./index.js";

// Export the original function for cases where tracking is not desired
export { createDoc as createDocWithoutTracking } from "./index.js";

// Default export is the enhanced createDoc with tracking
export default createDoc;
