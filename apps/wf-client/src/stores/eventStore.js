import * as sharedEvents from '@whatsfresh/shared-imports';
import { createLogger } from '@whatsfresh/shared-imports';
import { execEventType } from '../api/api';

const log = createLogger('EventStore');

// Static events - no API calls needed
let eventTypes = [];
let isInitialized = false;

export const isEventTypeServiceInitialized = () => isInitialized;

export const initEventTypeService = () => {
  if (isInitialized) {
    log.debug('EventTypeService already initialized');
    return Promise.resolve(eventTypes);
  }

  try {
    log.info('Loading event types from shared package');
    // Use conditional to handle possible import differences
    if (typeof sharedEvents.getClientSafeEventTypes === 'function') {
      eventTypes = sharedEvents.getClientSafeEventTypes();
    } else if (Array.isArray(sharedEvents.CLIENT_EVENTS)) {
      // Fallback: Create client-safe events directly
      eventTypes = sharedEvents.CLIENT_EVENTS.map(event => {
        const { qrySQL: _qrySQL, ...clientSafeEvent } = event; // Rename with underscore
        return clientSafeEvent;
      });
    } else {
      throw new Error('Invalid shared-events package structure');
    }
    log.info(`Loaded ${eventTypes.length} event types`);
    isInitialized = true;
    return Promise.resolve(eventTypes);
  } catch (error) {
    log.error('Failed to load event types:', error);
    return Promise.reject(error);
  }
};

export const getEventTypes = () => {
  if (!isInitialized) {
    log.warn('Attempting to access event types before initialization');
  }
  return eventTypes;
};

export const getEventType = (eventTypeId) => {
  return eventTypes.find(et => et.eventType === eventTypeId);
};

/**
 * Get event type configuration by event type ID
 * @param {string} eventTypeId - The event type identifier
 * @returns {Object|null} Event configuration or null if not found
 */
export const getEventTypeConfig = (eventTypeId) => {
  const eventType = getEventType(eventTypeId);
  if (!eventType) {
    log.warn(`Event type config not found for: ${eventTypeId}`);
    return null;
  }
  
  // Return event type configuration in the format the app expects
  return {
    eventType: eventType.eventType,
    method: eventType.method,
    params: eventType.params || [],
    purpose: eventType.purpose || ''
  };
};

export const resetEventTypeService = () => {
  isInitialized = false;
  eventTypes = [];
  log.info('EventTypeService reset');
};

/**
 * Execute an event with validation
 */
export const execEvent = async (eventType, params = {}) => {
  if (!isInitialized) {
    log.warn('Executing event before initialization');
    await initEventTypeService();
  }

  // Validate event exists in our definitions
  const eventDef = getEventType(eventType);
  if (!eventDef) {
    log.error(`Unknown event type: ${eventType}`);
    throw new Error(`Unknown event type: ${eventType}`);
  }

  // Log the execution
  log.debug(`Executing event: ${eventType}`, { params });

  // Call the API function to perform the actual API call
  return execEventType(eventType, params);
};


