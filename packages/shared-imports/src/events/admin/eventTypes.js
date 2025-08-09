/**
 * WhatsFresh Admin Event Types
 * Events related to account/user management and system administration
 * These events are intended for admin applications only
 */

/**
 * All admin event definitions
 */
// Note: Using cluster attribute in events instead of separate eventCategory

const EVENTS = [
  // Root entity (virtual) to organize hierarchy
  // Auth events
  
  
];

/**
 * Get an admin event by type
 */
function getEventType(eventType) {
  return EVENTS.find(e => e.eventType === eventType);
}

/**
 * Get child entities for an admin event type
 */
function getChildEntities(eventType) {
  return getEventType(eventType)?.children || [];
}

/**
 * Get parameters for an admin event
 */
function getEventParams(eventType) {
  return getEventType(eventType)?.params || [];
}

/**
 * Get safe admin event types (without SQL)
 */
function getSafeEventTypes() {
  return EVENTS.map(event => {
    const { qrySQL, ...safeEvent } = event;
    return safeEvent;
  });
}

export {
  EVENTS,
  getEventType,
  getChildEntities,
  getEventParams,
  getSafeEventTypes
};