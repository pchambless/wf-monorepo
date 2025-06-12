const { createRequestBody } = require('@utils/queryResolver');
const { executeQuery } = require('@utils/dbUtils');
const logger = require('@utils/logger');
const { EVENT_TYPES, getEventType } = require('@whatsfresh/shared-events');
const codeName = `[execEventType.js]`;

module.exports = async (req, res) => {
  // Log minimal request info - just the essentials
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { eventType, params } = req.body; 

  // Log sanitized parameters using the logger's built-in sanitization
  const sanitizedParams = logger.sanitizeLogData(params);
  logger.debug(`${codeName} Event: ${eventType}, Params:`, sanitizedParams);

  try {
    // Find the eventType using the shared-events function
    const eventRoute = getEventType(eventType);
    if (!eventRoute) {
      logger.warn(`${codeName} Invalid eventType: ${eventType}`);
      return res.status(400).json({
        error: 'Invalid eventType',
        message: `Event type '${eventType}' not found`
      });
    }

    const { qrySQL, method } = eventRoute;
    logger.debug(`${codeName} Executing query with method: ${method}`);

    // Use queryResolver to handle parameter substitution
    const qryMod = createRequestBody(qrySQL, params);
    
    // Execute the modified query
    const result = await executeQuery(qryMod, method);
    logger.info(`${codeName} Query executed successfully for ${eventType}`);
    res.json(result);

  } catch (error) {
    logger.error(`${codeName} Error executing event type:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
