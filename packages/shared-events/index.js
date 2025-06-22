/**
 * WhatsFresh Shared Events
 * Central export for all event types and utilities
 */

// Import client and admin events
const { 
  CLIENT_EVENTS, 
  getEventType: getClientEventType,
  getChildEntities: getClientChildEntities,
  getEventParams: getClientEventParams,
  getClientSafeEventTypes 
} = require('./src/client/eventTypes');

const { ADMIN_EVENTS, getAdminSafeEventTypes } = require('./src/admin/eventTypes');

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

// Export everything with backward compatibility
module.exports = {
  // Raw event collections
  CLIENT_EVENTS,
  ADMIN_EVENTS,
  ALL_EVENTS,
  
  
  // Helper functions
  getClientSafeEventTypes,
  getAdminSafeEventTypes,
  getAllEventTypes,
  getEventType,
  getEventParams: getClientEventParams,
  getChildEntities: getClientChildEntities,
};