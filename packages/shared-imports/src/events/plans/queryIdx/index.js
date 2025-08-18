/**
 * Server EventTypes Index
 * Imports query eventTypes only (with qrySQL attributes) for server-side database operations
 * 
 * Usage:
 * // In server
 * import { getAllQueryEvents, getEventType } from '@whatsfresh/shared-imports/events';
 * 
 * Note: React apps should import from their specific layout files:
 * - client-layout.js, admin-layout.js, plan-management-layout.js
 */

// Import query eventTypes from all pages  
import { planManagerQueryEvents } from "../eventTypes/pages/planManager/query/index.js";

// TODO: Add other page query imports as they're created
// import { dashboardQueryEvents } from './plans/eventTypes/pages/dashboard/query/index.js';

/**
 * Get ALL query events for server use
 * Only returns events with qrySQL attributes for database operations
 */
export function getPlanQueryEvents() {
    const planQueryEvents = [
        ...planManagerQueryEvents,
        // TODO: Add other page query events
        // ...dashboardQueryEvents,
    ];

    // Ensure all events have qrySQL attribute
  return planQueryEvents.filter((event) => event && event.qrySQL);
}

/**
 * Get ALL plan eventTypes (database + config + other) for Studio use
 * No filtering - returns everything
 */
export function getAllPlanQueryEvents() {
    return [
        ...planManagerQueryEvents,
        // TODO: Add other page query events
        // ...dashboardQueryEvents,
    ];
}
