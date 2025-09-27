/**
 * Controller wrapper for genPageConfig utility
 */

import { genPageConfig } from '../utils/pageConfig/index.js';
import logger from '../utils/logger.js';

const codeName = '[genPageConfigController.js]';

/**
 * Generate pageConfig from database using pageID
 */
const genPageConfigController = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const pageID = req.body?.pageID || req.query?.pageID;

  if (!pageID) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_PAGE_ID',
      message: 'pageID is required'
    });
  }

  try {
    logger.debug(`${codeName} Generating pageConfig for pageID: ${pageID}`);

    const result = await genPageConfig(pageID);

    logger.info(`${codeName} PageConfig generated successfully for pageID: ${pageID}`);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error(`${codeName} Error generating pageConfig for pageID ${pageID}:`, error);

    res.status(500).json({
      success: false,
      error: 'PAGECONFIG_GENERATION_FAILED',
      message: error.message,
      pageID: pageID
    });
  }
};

export default genPageConfigController;