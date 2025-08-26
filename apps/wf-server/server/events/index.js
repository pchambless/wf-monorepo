/**
 * Server EventTypes Index
 * Consolidates query eventTypes from all apps for server database operations
 *
 * Usage:
 * // In server
 * import { getAllQueryEvents, getEventType } from './events/index.js';
 *
 * Note: React apps should import from layoutIdx files:
 * - plans/layoutIdx/, client/layoutIdx/, admin/layoutIdx/
 */

// Import query eventTypes from each app (simplified structure)
import plansExports from "./plans/index.js";
import { EVENTS as clientEvents } from "./client/index.js";
// import adminEvents from "./admin/index.js"; // Skip admin for now

/**
 * Get ALL query events for server use
 * Consolidates from all apps
 */
export function getAllQueryEvents() {
  return [
    ...plansExports.plansQueryEvents,
    ...clientEvents,
    // ...adminEvents, // Skip admin for now
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
        return plansExports.plansQueryEvents;
      case "client":
        return clientEvents;
      case "admin":
        return []; // Skip admin for now
      default:
        console.warn(`Unknown app name: ${appName}`);
        return [];
    }
  } catch (error) {
    console.error(`Error loading eventTypes for ${appName}:`, error);
    return [];
  }
}

// Export missing functions that shared-imports main index expects
export function getClientSafeEventTypes() {
  return clientEvents.map(event => {
    const { qrySQL, ...clientSafeEvent } = event;
    return clientSafeEvent;
  });
}

export function getAdminSafeEventTypes() {
  return []; // Skip admin for now
}

export function getSafeEventTypes() {
  return [...getClientSafeEventTypes()];
}

export function getEventTypes() {
  return getAllQueryEvents();
}

export const eventTypes = getAllQueryEvents();
