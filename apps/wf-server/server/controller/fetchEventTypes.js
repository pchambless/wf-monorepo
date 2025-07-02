import sharedEventsPkg from '@whatsfresh/shared-events';
const { EVENT_TYPES } = sharedEventsPkg;
import logger from '../utils/logger.js';

const codeName = '[fetchEventTypes.js]';

async function fetchEventTypes(req, res) {
  try {
    logger.debug(`${codeName} Returning event types from shared-events package`, { count: EVENT_TYPES.length });
    res.json({
      success: true,
      data: EVENT_TYPES
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
