/**
 * execCreateDoc Controller
 * Parameter-driven document creation API following DML pattern
 * Universal approach - supports any file type anywhere with parameter substitution
 */

import path from "path";
import { generateContent } from "@whatsfresh/shared-imports/createDocs";
import { createDoc } from "@whatsfresh/shared-imports/utils/server";
import { createRequestBody } from "../utils/queryResolver.js";
import logger from "../utils/logger.js";

const codeName = `[execCreateDoc.js]`;

/**
 * Execute document creation API endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const execCreateDoc = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { targetPath, fileName, template, content, ...params } = req.body;

  try {
    // Step 1: Validate required parameters
    if (!targetPath || !fileName) {
      return res.status(400).json({
        error: "MISSING_PARAMETERS",
        message: "targetPath and fileName are required parameters",
      });
    }

    // Step 2: Use queryResolver for parameter substitution (like DML)
    const resolvedPath = createRequestBody(targetPath, params);
    const resolvedFileName = createRequestBody(fileName, params);

    logger.debug(`${codeName} Parameter substitution:`, {
      originalPath: targetPath,
      resolvedPath,
      originalFileName: fileName,
      resolvedFileName,
      params,
    });

    // Step 3: Generate document content
    let documentContent;

    if (template) {
      // Use template to generate content
      try {
        documentContent = generateContent(template, { content, ...params });
      } catch (templateError) {
        return res.status(400).json({
          error: "TEMPLATE_ERROR",
          message: `Template generation failed: ${templateError.message}`,
        });
      }
    } else {
      // Use raw content
      documentContent = content || "No content provided";
    }

    // Step 4: Create the document using createDoc utility
    const result = await createDoc(
      resolvedPath,
      resolvedFileName,
      documentContent
    );

    // Step 5: Return enhanced result
    if (result.success) {
      const enhancedResult = {
        ...result,
        template,
        resolvedPath,
        resolvedFileName,
        originalPath: targetPath,
        originalFileName: fileName,
      };

      logger.info(`${codeName} Document created successfully:`, {
        fileName: resolvedFileName,
        path: resolvedPath,
        template,
      });

      res.json(enhancedResult);
    } else {
      logger.warn(`${codeName} Document creation failed:`, result);
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error(`${codeName} Error creating document:`, error);

    // Use error status if available, default to 500
    const status = error.status || 500;

    res.status(status).json({
      error: error.code || "DOC_CREATION_FAILED",
      message: error.message,
    });
  }
};

export default execCreateDoc;
