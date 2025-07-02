/**
 * Event handling utilities for WhatsFresh applications
 * @module events
 */
import { 
  getClientSafeEventTypes, 
  getAdminSafeEventTypes 
} from '@whatsfresh/shared-events';

/**
 * Create an event service for the specified application type
 */
export function createEventService(options = {}) {
  const {
    logger = console,
    isAdmin = false,
  } = options;
  
  let eventTypes = [];
  let initialized = false;
  
  /**
   * Initialize event types for this application
   */
  function initialize() {
    if (initialized) return eventTypes;
    
    // Load appropriate event types based on app type
    logger.info(`Initializing ${isAdmin ? 'admin' : 'client'} event types`);
    eventTypes = isAdmin 
      ? getAdminSafeEventTypes() 
      : getClientSafeEventTypes();
    
    logger.info(`Loaded ${eventTypes.length} event types`);
    initialized = true;
    
    return eventTypes;
  }
  
  /**
   * Get all loaded event types
   */
  function getEvents() {
    if (!initialized) {
      initialize();
    }
    return eventTypes;
  }
  
  /**
   * Get a specific event type by ID
   */
  function getEvent(eventTypeId) {
    if (!initialized) {
      initialize();
    }
    return eventTypes.find(e => e.eventType === eventTypeId);
  }
  
  return {
    initialize,
    getEvents,
    getEvent,
    isInitialized: () => initialized
  };
}

/**
 * Create client-specific event service
 */
export const createClientEventService = (options = {}) => 
  createEventService({ ...options, isAdmin: false });

/**
 * Create admin-specific event service
 */
export const createAdminEventService = (options = {}) => 
  createEventService({ ...options, isAdmin: true });

/**
 * Default client event service
 */
export const clientEvents = createClientEventService();

/**
 * Default admin event service
 */
export const adminEvents = createAdminEventService();