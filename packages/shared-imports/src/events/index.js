/**
 * Shared Events Package
 * Exports event type definitions for the entire WhatsFresh monorepo
 */

// Internal imports
import * as clientEvents from './client/eventTypes.js';
import * as adminEvents from './admin/eventTypes.js';
import * as eventCategory from './eventCategory.js';

// Re-export event categories
export * from './eventCategory.js';

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

// Export event category enum for typing and validation
export const EVENT_CATEGORY = eventCategory.EVENT_CATEGORY;
