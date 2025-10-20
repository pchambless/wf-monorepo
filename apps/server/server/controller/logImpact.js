import {
  ImpactLogger,
  logImpact,
  logBatchImpacts,
} from "../utils/impactLogger.js";
import logger from "../utils/logger.js";

const codeName = "[logImpact.js]";

/**
 * Log development impacts for Claude/Kiro coordination
 */
const logImpactController = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { impacts, planId = 1, single = false } = req.body;

    let result;

    if (single && impacts) {
      // Single impact logging
      result = await logImpact(impacts);
    } else if (Array.isArray(impacts)) {
      // Batch impact logging
      result = await logBatchImpacts(impacts, planId);
    } else {
      throw new Error(
        "Invalid request format. Expected impacts array or single impact with single=true"
      );
    }

    logger.info(`${codeName} Impact logging completed successfully`);
    res.json(result);
  } catch (error) {
    logger.error(`${codeName} Impact logging failed:`, error);

    const status = error.status || 500;
    res.status(status).json({
      error: error.code || "IMPACT_LOGGING_FAILED",
      message: error.message,
    });
  }
};

/**
 * Get recent impacts for coordination
 */
const getRecentImpacts = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { hours = 24 } = req.query;
    const impacts = await ImpactLogger.getRecentImpacts(parseInt(hours));

    logger.info(`${codeName} Retrieved ${impacts.length} recent impacts`);
    res.json({ impacts, count: impacts.length });
  } catch (error) {
    logger.error(`${codeName} Failed to get recent impacts:`, error);

    const status = error.status || 500;
    res.status(status).json({
      error: error.code || "GET_IMPACTS_FAILED",
      message: error.message,
    });
  }
};

/**
 * Get batch impacts for related changes
 */
const getBatchImpacts = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { batchId } = req.params;
    const impacts = await ImpactLogger.getBatchImpacts(batchId);

    logger.info(
      `${codeName} Retrieved ${impacts.length} impacts for batch ${batchId}`
    );
    res.json({ impacts, count: impacts.length, batchId });
  } catch (error) {
    logger.error(`${codeName} Failed to get batch impacts:`, error);

    const status = error.status || 500;
    res.status(status).json({
      error: error.code || "GET_BATCH_IMPACTS_FAILED",
      message: error.message,
    });
  }
};

export { logImpactController as default, getRecentImpacts, getBatchImpacts };
