/**
 * WhatsFresh Shared Event Types
 * Single source of truth for event definitions and relationships
 */

/**
 * All event definitions including SQL and relationships
 * Using cluster attribute instead of separate eventCategory
 */

const EVENTS = [
  // Root entity (virtual) to organize hierarchy

  // LOGIN
  
 
  // INGREDIENTS

  // PRODUCTS
  



  // REFERENCE
 
 
  
  // RECIPES
  
  // MAPPING DETAIL
  
  
  
  

  // WORKSHEET GENERATION
  
  

];

/**
 * Get an event by type
 */
function getEventType(eventType) {
  return EVENTS.find(e => e.eventType === eventType); // Changed from EVENT_TYPES
}

/**
 * Get child entities for an event type
 */
function getChildEntities(eventType) {
  return getEventType(eventType)?.children || [];
}

/**
 * Get parameters for an event
 */
function getEventParams(eventType) {
  return getEventType(eventType)?.params || [];
}

/**
 * Get client-safe event types (without SQL)
 */
function getSafeEventTypes() {
  return EVENTS.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

// ES module exports
export {
  EVENTS,
  getEventType,
  getChildEntities,
  getEventParams,
  getSafeEventTypes
};