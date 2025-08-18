/**
 * Client Layout EventTypes Index
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
 * Get all client layout events (for main index.js)
 */
export const getClientLayoutEvents = () => layoutEvents;

// Default export for backward compatibility
export default {
  layoutEvents,
  getLayoutEvent,
  getClientLayoutEvents
};