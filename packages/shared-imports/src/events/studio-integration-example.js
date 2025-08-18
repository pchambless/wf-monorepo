/**
 * Studio Integration Example
 * Shows how Studio can dynamically load layout eventTypes without server conflicts
 */

import { getLayoutEvents, getLayoutEventType } from "./index.js";

/**
 * Example: Studio Canvas Component
 * Loads layout eventTypes dynamically for design-time use
 */
export class StudioCanvas {
  constructor(app = "plans") {
    this.app = app;
    this.layoutEvents = [];
  }

  /**
   * Initialize Studio with layout eventTypes for the specified app
   */
  async initialize() {
    try {
      this.layoutEvents = await getLayoutEvents(this.app);
      console.log(
        `Loaded ${this.layoutEvents.length} layout events for ${this.app}`
      );
      return this.layoutEvents;
    } catch (error) {
      console.error("Failed to initialize Studio canvas:", error);
      return [];
    }
  }

  /**
   * Get available page eventTypes for Studio canvas
   */
  getPageEventTypes() {
    return this.layoutEvents.filter(
      (event) => event.category === "page" || event.eventType.startsWith("page")
    );
  }

  /**
   * Get available tab eventTypes for Studio canvas
   */
  getTabEventTypes() {
    return this.layoutEvents.filter(
      (event) => event.category === "tab" || event.eventType.startsWith("tab")
    );
  }

  /**
   * Find eventType by ID for Studio widget binding
   */
  async findEventTypeById(eventType) {
    return await getLayoutEventType(eventType, this.app);
  }

  /**
   * Generate navigation structure for Studio preview
   */
  generateNavStructure() {
    const pages = this.getPageEventTypes();
    return pages.map((page) => ({
      eventType: page.eventType,
      title: page.title,
      routePath: page.routePath,
      children: page.navChildren || [],
    }));
  }
}

/**
 * Example usage in Studio
 */
export async function initializeStudioForApp(appName) {
  const studio = new StudioCanvas(appName);
  await studio.initialize();

  // Get navigation structure for Studio UI
  const navStructure = studio.generateNavStructure();

  // Get available components for drag-and-drop
  const pages = studio.getPageEventTypes();
  const tabs = studio.getTabEventTypes();

  return {
    studio,
    navStructure,
    availableComponents: { pages, tabs },
  };
}
