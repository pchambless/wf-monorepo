import sharedEventsPkg from '@whatsfresh/shared-events';
const { EVENT_TYPES, getEventType } = sharedEventsPkg;
import logger from './logger.js';

const codeName = '[eventTypeManager.js]';

/**
 * Get event configuration by eventType
 */
function getEventConfig(eventType) {
  const eventConfig = getEventType(eventType);
  if (!eventConfig) {
    logger.error(`${codeName} Unknown event type: ${eventType}`);
    throw new Error(`Unknown event type: ${eventType}`);
  }
  return eventConfig;
}

/**
 * Validate if an event has all required parameters
 */
function validateEventParams(event, params = {}) {
  const eventConfig = getEventConfig(event.type);
  
  // Get required parameters
  const requiredParams = eventConfig.params || [];
  
  // Check for missing parameters
  const missingParams = requiredParams.filter(param => {
    const paramName = param.replace(':', '');
    return params[paramName] === undefined;
  });
  
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }
  
  return true;
}

// Simple module with the essential functions
const eventTypeManager = {
  getEventConfig,
  validateEventParams,
  eventTypes: EVENT_TYPES,
  
  // For backwards compatibility with existing code:
  getEventTypes: () => Promise.resolve(EVENT_TYPES),
  findEventType: (eventType) => Promise.resolve(getEventType(eventType))
};

export default eventTypeManager;
