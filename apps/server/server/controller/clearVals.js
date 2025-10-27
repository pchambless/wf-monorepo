import { setValsDirect } from './setVals.js';
import { getValDirect } from './getVal.js';
import logger from '../utils/logger.js';

const codeName = '[clearVals.js]';

// Convenience controller - converts paramNames to setVals with null values
const clearVals = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { paramNames } = req.body;

  if (!paramNames) {
    return res.status(400).json({
      error: 'MISSING_PARAM_NAMES',
      message: 'paramNames array is required'
    });
  }

  if (!Array.isArray(paramNames) || paramNames.length === 0) {
    return res.status(400).json({
      error: 'INVALID_PARAM_NAMES',
      message: 'paramNames must be a non-empty array'
    });
  }

  try {
    // Get user email from request body, session, or default
    const userEmail = req.body.userEmail ||
                      req.session?.userEmail ||
                      'pc7900@gmail.com';

    // Convert paramNames to values array with null paramVals
    const values = paramNames.map(paramName => ({
      paramName,
      paramVal: null
    }));

    // Use setValsDirect to do the actual work
    const results = await setValsDirect(userEmail, values);

    logger.debug(`${codeName} Cleared ${results.length} values for ${userEmail}`);

    res.json({
      userEmail,
      clearedParams: paramNames,
      results,
      totalCleared: results.length
    });

  } catch (error) {
    logger.error(`${codeName} Error in clearVals controller:`, error);

    res.status(500).json({
      error: 'CLEARVALS_FAILED',
      message: error.message
    });
  }
};

export default clearVals;