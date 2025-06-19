/**
 * WhatsFresh Shared Events
 * Main entry point that aggregates all event types and helper functions
 */

// Import modules
const crudEvents = require('./crudEvents');
const mapEvents = require('./mapEvents');
const adminEvents = require('./adminEvents');

// Destructure what we need
const { CRUD_EVENTS, getEventType, getParentEntity, getChildEntities, 
        getEventParams, getClientSafeEventTypes } = crudEvents;
const { MAP_EVENTS } = mapEvents;
const { ADMIN_EVENTS } = adminEvents;

// Create CLIENT_EVENTS for regular client applications
const CLIENT_EVENTS = [...CRUD_EVENTS, ...MAP_EVENTS];

// ALL_EVENTS includes everything (for documentation purposes)
const ALL_EVENTS = [...CLIENT_EVENTS, ...ADMIN_EVENTS];

/**
 * Get an event by type from client events
 */
function getClientEventType(eventType) {
  return CLIENT_EVENTS.find(e => e.eventType === eventType);
}

/**
 * Get an event by type from any collection (including admin)
 */
function getAllEventType(eventType) {
  return ALL_EVENTS.find(e => e.eventType === eventType);
}

// Re-export everything
module.exports = {
  // Individual event collections
  CRUD_EVENTS,
  MAP_EVENTS,
  ADMIN_EVENTS,
  
  // Combined collections
  CLIENT_EVENTS,    // Regular client events (CRUD + MAP)
  ALL_EVENTS,       // Everything including admin events (for documentation)
  
  // Functions for working with events
  getEventType,     // For CRUD events only
  getClientEventType, // For client events (CRUD + MAP)
  getAllEventType,  // For any event including admin
  getParentEntity,
  getChildEntities,
  getEventParams,
  getClientSafeEventTypes,
  
  // Admin functions
  getAdminEventType: adminEvents.getAdminEventType,
  
  // Submodules for direct imports
  crudEvents,
  mapEvents,
  adminEvents
};