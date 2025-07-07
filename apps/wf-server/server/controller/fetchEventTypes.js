import { eventTypes } from '@whatsfresh/shared-imports/events';
import logger from '../utils/logger.js';

const codeName = '[fetchEventTypes.js]';

async function fetchEventTypes(req, res) {
  try {
    const eventTypesArray = eventTypes.EVENTS;
    logger.debug(`${codeName} Returning event types from shared-imports package`, { count: eventTypesArray.length });
    res.json({
      success: true,
      data: eventTypesArray
    });
  } catch (error) {
    logger.error(`${codeName} Error fetching event types:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event types',
      error: error.message
    });
  }
}

export {
  fetchEventTypes
};
