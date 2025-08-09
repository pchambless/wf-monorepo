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
import * as clientEvents from './client/eventTypes/index.js';
import * as adminEvents from './admin/eventTypes/index.js';
import * as planEvents from './plans/eventTypes/index.js';

/**
 * Get event types based on app context (DEPRECATED - use getSafeEventTypes with explicit app parameter)
 * @returns {Object} Event type definitions for current app
 */
export function getEventTypes() {
    // Detect app context from environment or process (deprecated pattern)
    const APP = process.env.REACT_APP_TYPE || process.env.APP_TYPE || 'client';

    if (APP === 'admin') {
        return { ...adminEvents, ...planEvents };
    }
    return { ...clientEvents, ...planEvents };
}

/**
 * Get event type definition by eventType string
 * @param {string} eventType - The event type to find
 * @returns {Object|undefined} Event definition or undefined if not found
 */
export function getEventType(eventType) {
    // Search through ALL events (client + admin + plans) for server compatibility
    const allEvents = getAllEvents();
    return allEvents.find(event => event && event.eventType === eventType);
}

/**
 * Export event types for current app context (DEPRECATED - apps should use getSafeEventTypes explicitly)
 * This provides a consistent interface regardless of client/admin
 */
export const eventTypes = getEventTypes();

// Generic function that returns safe event types for current app context
export function getSafeEventTypes(app = 'client') {
    const planEventsList = planEvents.PLAN_EVENTS || [];
    if (app === 'admin') {
        return [...(adminEvents.EVENTS || []), ...planEventsList];
    }
    return [...(clientEvents.EVENTS || []), ...planEventsList];
}

/**
 * Get ALL events from all contexts (for server use)
 * Server only needs events with qrySQL attributes for database operations
 */
export function getAllEvents() {
    const clientEventsList = clientEvents.EVENTS || [];
    const adminEventsList = adminEvents.EVENTS || [];
    const planEventsList = planEvents.PLAN_EVENTS || [];

    const allEvents = [...clientEventsList, ...adminEventsList, ...planEventsList];

    // Filter to only return events that have qrySQL attribute (server only needs SQL events)
    return allEvents.filter(event => event && event.qrySQL);
}

// Legacy exports for backward compatibility (actively used in client/admin apps)
export function getClientSafeEventTypes() {
    const planEventsList = planEvents.PLAN_EVENTS || [];
    return [...(clientEvents.EVENTS || []), ...planEventsList];
}

export function getAdminSafeEventTypes() {
    const planEventsList = planEvents.PLAN_EVENTS || [];
    return [...(adminEvents.EVENTS || []), ...planEventsList];
}

