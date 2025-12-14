import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';
import { getUserEmail } from '../utils/getUserEmail.js';

const codeName = '[getVal.js]';

// Direct function for internal use (execEvent, etc.)
export const getValDirect = async (userEmail, paramName, format = 'raw') => {
  try {
    const sql = `
      SELECT paramVal
      FROM api_wf.context_store
      WHERE email = '${userEmail}' AND paramName = '${paramName}'
    `;

    const result = await executeQuery(sql, 'GET');

    if (!result || result.length === 0) {
      logger.warn(`${codeName} No value found for parameter: ${paramName}`);
      return null;
    }

    const rawValue = result[0].paramVal;

    // Increment reads counter for performance tracking
    const updateReadsSql = `
      UPDATE api_wf.context_store
      SET getVals = getVals + 1
      WHERE email = '${userEmail}' AND paramName = '${paramName}'
    `;
    await executeQuery(updateReadsSql, 'PATCH');

    // Format for different use cases
    if (format === 'sql') {
      // For SQL replacement - quote strings, leave numbers unquoted
      return /^[0-9]+$/.test(rawValue) ? rawValue : `'${rawValue}'`;
    } else {
      // Raw value for client use
      return rawValue;
    }

  } catch (error) {
    logger.error(`${codeName} Error retrieving parameter ${paramName}:`, error);
    throw error;
  }
};

// Controller for API endpoints
const getVal = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { paramName, format } = req.query;

  if (!paramName) {
    return res.status(400).json({
      error: 'MISSING_PARAM_NAME',
      message: 'paramName query parameter is required'
    });
  }

  try {
    // Get user email using centralized function
    const userEmail = getUserEmail(req);
    const resolvedValue = await getValDirect(userEmail, paramName, format);

    if (resolvedValue === null) {
      return res.status(404).json({
        error: 'PARAM_NOT_FOUND',
        message: `No value found for parameter: ${paramName}`,
        paramName
      });
    }

    logger.debug(`${codeName} Retrieved value for ${paramName}: ${resolvedValue}`);

    res.json({
      paramName,
      resolvedValue,
      userEmail
    });

  } catch (error) {
    logger.error(`${codeName} Error in getVal controller:`, error);

    res.status(500).json({
      error: 'GETVAL_FAILED',
      message: error.message,
      paramName
    });
  }
};

export default getVal;