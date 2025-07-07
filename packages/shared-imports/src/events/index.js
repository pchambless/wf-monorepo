/**
 * Shared Events Package
 * Exports event type definitions for the entire WhatsFresh monorepo
 * 
 * Usage:
 * // In client app
 * import { eventTypes, getEventType } from '@whatsfresh/shared-imports/events';
 * 
 * // In admin app  
 * import { eventTypes, getEventType } from '@whatsfresh/shared-imports/events';
 * 
 * Both apps get the same named exports but different event sets based on context
 */

// Internal imports
import * as clientEvents from './client/eventTypes.js';
import * as adminEvents from './admin/eventTypes.js';

// Detect app context from environment or process
const APP = process.env.REACT_APP_TYPE || process.env.APP_TYPE || 'client';

/**
 * Get event types based on current app context
 * @returns {Object} Event type definitions for current app
 */
export function getEventTypes() {
    if (APP === 'admin') {
        return { ...adminEvents };
    }
    return { ...clientEvents };
}

/**
 * Get event type definition by eventType string
 * @param {string} eventType - The event type to find
 * @returns {Object|undefined} Event definition or undefined if not found
 */
export function getEventType(eventType) {
    const events = getEventTypes();

    // Try the getEventType function from the current app's events
    if (events.getEventType) {
        return events.getEventType(eventType);
    }

    // Fallback: search through all events in current context
    const allEvents = Object.values(events);
    return allEvents.find(event => event && event.eventType === eventType);
}

/**
 * Export event types for current app context
 * This provides a consistent interface regardless of client/admin
 */
export const eventTypes = getEventTypes();

// Generic function that returns safe event types for current app context
export function getSafeEventTypes() {
    if (APP === 'admin') {
        return adminEvents.EVENTS || [];
    }
    return clientEvents.EVENTS || [];
}

// Legacy exports for backward compatibility
export function getClientSafeEventTypes() {
    return clientEvents.EVENTS || [];
}

export function getAdminSafeEventTypes() {
    return adminEvents.EVENTS || [];
}

