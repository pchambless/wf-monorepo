import { executeEventType } from '../utils/executeEventType.js';
import logger from '../utils/logger.js';

const codeName = `[execEventType.js]`;

const execEventType = async (req, res) => {
  // Log minimal request info - just the essentials
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { eventType, params } = req.body;

  try {
    // Use shared utility for event execution
    const result = await executeEventType(eventType, params);
    res.json(result);

  } catch (error) {
    logger.error(`${codeName} Error executing event type:`, error);
    
    // Use error status if available, default to 500
    const status = error.status || 500;
    
    res.status(status).json({
      error: error.code || 'EVENT_EXECUTION_FAILED',
      message: error.message
    });
  }
};

export default execEventType;
