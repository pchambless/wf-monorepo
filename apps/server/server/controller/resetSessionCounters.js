import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';

const codeName = '[resetSessionCounters.js]';

/**
 * Reset updates counter for all user's context_store values
 * Call this on user login to start fresh session tracking
 */
export const resetSessionCounters = async (userEmail) => {
  try {
    const sql = `
      UPDATE api_wf.context_store 
      SET updates = 0,
          getVals = 0
      WHERE email = '${userEmail}'
    `;

    const result = await executeQuery(sql, 'POST');
    
    logger.info(`${codeName} Reset session counters for ${userEmail}, affected rows: ${result.affectedRows}`);
    
    return {
      userEmail,
      resetCount: result.affectedRows,
      status: 'success'
    };

  } catch (error) {
    logger.error(`${codeName} Error resetting session counters:`, error);
    throw error;
  }
};

// Controller for API endpoint (optional)
const resetSessionCountersController = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({
        error: 'MISSING_EMAIL',
        message: 'userEmail is required'
      });
    }

    const result = await resetSessionCounters(userEmail);

    res.json(result);

  } catch (error) {
    logger.error(`${codeName} Error in controller:`, error);

    res.status(500).json({
      error: 'RESET_FAILED',
      message: error.message
    });
  }
};

export default resetSessionCountersController;