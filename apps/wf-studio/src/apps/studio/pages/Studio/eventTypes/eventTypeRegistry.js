/**
 * Studio Page EventType Registry
 * Numeric ID system for cleaner references and easier refactoring
 */

export const eventTypeRegistry = {
  // Core page structure
  1: "pageStudio",
  2: "tabsWorkArea",

  // Main tabs
  3: "tabMermaid",
  4: "tabEventDtl",
  5: "tabPageView",

  // Component Detail sub-containers
  6: "containerEventStructure",
  7: "containerEventCards",
  8: "containerEventChanges",

  // Sidebar components
  9: "sidebarLeft",
  10: "componentChoices",

  // Future eventTypes - reserve IDs
  // 11-15: Additional containers
  // 16-20: Form components
  // 21-25: Data display components
  // 26-30: Workflow components
};

// Reverse lookup: name to ID
export const eventTypeIds = Object.fromEntries(
  Object.entries(eventTypeRegistry).map(([id, name]) => [name, parseInt(id)])
);

// Helper functions
export function getEventTypeName(id) {
  return eventTypeRegistry[id];
}

export function getEventTypeId(name) {
  return eventTypeIds[name];
}

// Validation
export function validateEventTypeId(id) {
  return eventTypeRegistry.hasOwnProperty(id);
}