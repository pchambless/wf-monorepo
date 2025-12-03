import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';
import { getUserEmail } from '../utils/getUserEmail.js';

const codeName = '[populateModules.js]';

/**
 * Populate modules database from analysis
 * Dedicated endpoint for nightly cron job
 * POST /api/populateModules
 *
 * Body:
 * {
 *   operation: "load" | "map",
 *   modules: [...],        // for load operation
 *   dependencies: [...],   // for map operation
 *   userId: "system",
 *   userEmail: "system@whatsfresh.ai"
 * }
 */
const populateModules = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { operation, modules, dependencies, userId } = req.body;

  if (!operation || !['load', 'map'].includes(operation)) {
    return res.status(400).json({
      error: 'INVALID_OPERATION',
      message: 'operation must be "load" or "map"'
    });
  }

  try {
    // Get user email for audit trail
    const userEmail = getUserEmail(req);

    let result;

    if (operation === 'load') {
      // Phase 1: Load modules
      if (!modules || !Array.isArray(modules)) {
        return res.status(400).json({
          error: 'MISSING_MODULES',
          message: 'modules array is required for load operation'
        });
      }

      // Batch modules to avoid max_allowed_packet issues (100 modules per batch)
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < modules.length; i += BATCH_SIZE) {
        batches.push(modules.slice(i, i + BATCH_SIZE));
      }

      logger.info(`${codeName} Loading ${modules.length} modules in ${batches.length} batches`);

      const sql = 'CALL api_wf.sp_module_load(?, ?)';
      const results = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const jsonString = JSON.stringify(batch);
        logger.debug(`${codeName} Batch ${i+1}/${batches.length}: ${batch.length} modules (${jsonString.length} chars)`);
        const batchResult = await executeQuery(sql, 'GET', [jsonString, userId || 'system']);
        results.push(batchResult);
      }

      result = results[results.length - 1]; // Return final batch result

    } else if (operation === 'map') {
      // Phase 2: Map dependencies
      if (!dependencies || !Array.isArray(dependencies)) {
        return res.status(400).json({
          error: 'MISSING_DEPENDENCIES',
          message: 'dependencies array is required for map operation'
        });
      }

      // Batch dependencies to avoid max_allowed_packet issues (100 deps per batch)
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < dependencies.length; i += BATCH_SIZE) {
        batches.push(dependencies.slice(i, i + BATCH_SIZE));
      }

      logger.info(`${codeName} Mapping ${dependencies.length} dependencies in ${batches.length} batches`);

      const sql = 'CALL api_wf.sp_module_map(?, ?)';
      const results = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const jsonString = JSON.stringify(batch);
        logger.debug(`${codeName} Batch ${i+1}/${batches.length}: ${batch.length} deps (${jsonString.length} chars)`);
        const batchResult = await executeQuery(sql, 'GET', [jsonString, userId || 'system']);
        results.push(batchResult);
      }

      result = results[results.length - 1]; // Return final batch result
    }

    logger.info(`${codeName} Module ${operation} completed successfully`);

    res.json({
      operation,
      data: result,
      userEmail
    });

  } catch (error) {
    logger.error(`${codeName} Module ${operation} failed:`, error);

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || 'MODULE_OPERATION_FAILED',
      message: error.message,
      operation
    });
  }
};

export default populateModules;
