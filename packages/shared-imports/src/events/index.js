/**
 * Server EventTypes Index
 * Consolidates query eventTypes from all apps for server database operations
 *
 * Usage:
 * // In server
 * import { getAllQueryEvents, getEventType } from '@whatsfresh/shared-imports/events';
 *
 * Note: React apps should import from layoutIdx files:
 * - plans/layoutIdx/, client/layoutIdx/, admin/layoutIdx/
 */

// Import consolidated query eventTypes from each app
import { getPlanQueryEvents, getAllPlanQueryEvents } from "./plans/queryIdx/index.js";
import { getClientQueryEvents } from "./client/queryIdx/index.js";
import { getAdminQueryEvents } from "./admin/queryIdx/index.js";

// Import layout eventTypes from each app
import { getPlanLayoutEvents } from "./plans/layoutIdx/index.js";
import { getClientLayoutEvents } from "./client/layoutIdx/index.js";
import { getAdminLayoutEvents } from "./admin/layoutIdx/index.js";

/**
 * Get ALL query events for server use
 * Consolidates from all app queryIdx files
 */
export function getAllQueryEvents() {
  return [
    ...getPlanQueryEvents(),
    ...getClientQueryEvents(),
    ...getAdminQueryEvents(),
  ];
}

/**
 * Get specific event type by eventType string
 * @param {string} eventType - The event type to find
 * @returns {Object|undefined} Event definition or undefined if not found
 */
export function getEventType(eventType) {
  const allEvents = getAllQueryEvents();
  return allEvents.find((event) => event && event.eventType === eventType);
}

// Legacy compatibility - server uses this
export const getAllEvents = getAllQueryEvents;

/**
 * Get ALL eventTypes (layout + query) for a specific app (Studio use)
 * @param {string} appName - App name (plans, client, admin)
 * @returns {Promise<Array>} All eventTypes for the app
 */
export async function getAppAllEvents(appName) {
  try {
    switch (appName.toLowerCase()) {
      case "plans":
        return [
          ...getPlanLayoutEvents(),
          ...getAllPlanQueryEvents()
        ];
      case "client":
        return [
          ...getClientLayoutEvents(),
          ...getClientQueryEvents()
        ];
      case "admin":
        return [
          ...getAdminLayoutEvents(),
          ...getAdminQueryEvents()
        ];
      default:
        console.warn(`Unknown app name: ${appName}`);
        return [];
    }
  } catch (error) {
    console.error(`Error loading eventTypes for ${appName}:`, error);
    // Fallback to query events only if layout events fail to load
    switch (appName.toLowerCase()) {
      case "plans":
        return getPlanQueryEvents();
      case "client":
        return getClientQueryEvents();
      case "admin":
        return getAdminQueryEvents();
      default:
        return [];
    }
  }
}
