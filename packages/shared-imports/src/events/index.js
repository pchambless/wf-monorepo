/**
 * Shared Events Package
 * Exports event type definitions for the entire WhatsFresh monorepo
 */

// Internal imports
import * as clientEvents from './client/eventTypes.js';
import * as adminEvents from './admin/eventTypes.js';

/**
 * Get client-safe event types
 * @returns {Object} Client event type definitions
 */
export function getClientSafeEventTypes() {
    return { ...clientEvents };
}

/**
 * Get admin-safe event types
 * @returns {Object} Admin event type definitions
 */
export function getAdminSafeEventTypes() {
    return { ...adminEvents };
}

/**
 * Get event type definition by eventType string
 * @param {string} eventType - The event type to find
 * @returns {Object|undefined} Event definition or undefined if not found
 */
export function getEventType(eventType) {
    // Try client events first
    const { getEventType: getClientEventType } = clientEvents;
    if (getClientEventType) {
        const clientEvent = getClientEventType(eventType);
        if (clientEvent) return clientEvent;
    }
    
    // Try admin events
    const { getEventType: getAdminEventType } = adminEvents;
    if (getAdminEventType) {
        return getAdminEventType(eventType);
    }
    
    return undefined;
}

