/**
 * Admin Layout EventTypes Index
 * Aggregates all individual eventType files into ADMIN_LAYOUT_EVENTS array
 */
// Aggregate all eventTypes into PLAN_EVENTS array
export const layoutEvents = [];

/**
 * Get event by eventType
 */
export const getLayoutEvent = (eventType) => {
  return layoutEvents.find((event) => event.eventType === eventType);
};
/**
 * Get all admin layout events (for main index.js)
 */
export const getAdminLayoutEvents = () => layoutEvents;

// Default export for backward compatibility
export default {
  layoutEvents,
  getLayoutEvent,
  getAdminLayoutEvents
};