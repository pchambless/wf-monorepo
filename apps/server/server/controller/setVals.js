import { executeQuery } from '../utils/dbUtils.js';
import { getValDirect } from './getVal.js';
import logger from '../utils/logger.js';
import { getUserEmail } from '../utils/getUserEmail.js';

const codeName = '[setVals.js]';

// Direct function for internal use
export const setValsDirect = async (userEmail, values) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Values must be a non-empty array');
  }

  try {
    // Get current user's firstName for audit trail
    const firstName = await getValDirect(userEmail, 'firstName', 'raw') || 'system';
    const results = [];

    for (const { paramName, paramVal } of values) {
      if (!paramName) {
        throw new Error('Each value must have a paramName');
      }

      // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert functionality
      const sql = `
        INSERT INTO api_wf.context_store
        (email, paramName, paramVal, created_by)
        VALUES ('${userEmail}', '${paramName}', ${paramVal === null ? 'NULL' : `'${paramVal}'`}, '${firstName}')
        ON DUPLICATE KEY UPDATE
        paramVal = ${paramVal === null ? 'NULL' : `'${paramVal}'`},
        updated_by = '${firstName}',
        updated_at = CURRENT_TIMESTAMP
      `;

      const result = await executeQuery(sql, 'POST');
      results.push({ paramName, paramVal, status: 'success' });
    }

    return results;

  } catch (error) {
    logger.error(`${codeName} Error in setValsDirect:`, error);
    throw error;
  }
};

// Controller for API endpoints
const setVals = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { values } = req.body;

  if (!values) {
    return res.status(400).json({
      error: 'MISSING_VALUES',
      message: 'values array is required'
    });
  }

  if (!Array.isArray(values) || values.length === 0) {
    return res.status(400).json({
      error: 'INVALID_VALUES',
      message: 'values must be a non-empty array'
    });
  }

  try {
    // Get user email using centralized function
    const userEmail = getUserEmail(req);
    const results = await setValsDirect(userEmail, values);

    logger.debug(`${codeName} Set ${results.length} values for ${userEmail}`);

    res.json({
      userEmail,
      results,
      totalSet: results.length
    });

  } catch (error) {
    logger.error(`${codeName} Error in setVals controller:`, error);

    res.status(500).json({
      error: 'SETVALS_FAILED',
      message: error.message
    });
  }
};

export default setVals;