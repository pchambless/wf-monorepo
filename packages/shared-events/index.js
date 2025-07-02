/**
 * WhatsFresh Shared Events
 * Central export for all event types and utilities
 */

// Import client and admin events using ES modules
import { 
  EVENTS as CLIENT_EVENTS, 
  getEventType as getClientEventType,
  getChildEntities as getClientChildEntities,
  getEventParams as getClientEventParams,
  getSafeEventTypes as getClientSafeEventTypes 
} from './src/client/eventTypes.js';

import { EVENTS as ADMIN_EVENTS, getSafeEventTypes as getAdminSafeEventTypes } from './src/admin/eventTypes.js';

// Combined events for server-side use
const ALL_EVENTS = [...CLIENT_EVENTS, ...ADMIN_EVENTS];

/**
 * Get an event by type from any collection
 */
function getEventType(eventType) {
  return ALL_EVENTS.find(e => e.eventType === eventType) || 
         getClientEventType(eventType);
}

/**
 * Get all event types (with SQL) for server
 */
function getAllEventTypes() {
  return ALL_EVENTS;
}

// Export everything using ES modules
export {
  // Raw event collections
  CLIENT_EVENTS,
  ADMIN_EVENTS,
  ALL_EVENTS,
  
  // Helper functions
  getClientSafeEventTypes,
  getAdminSafeEventTypes,
  getAllEventTypes,
  getEventType,
  getClientEventParams as getEventParams,
  getClientChildEntities as getChildEntities,
};