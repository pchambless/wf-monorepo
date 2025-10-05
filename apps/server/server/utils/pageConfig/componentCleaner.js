/**
 * Component Cleaner - Handles cleaning components for PageRenderer consumption
 */

import logger from "../logger.js";

const codeName = "[componentCleaner.js]";

/**
 * Clean components for rendering - remove metadata bloat, keep only what PageRenderer needs
 */
export function cleanComponentsForRendering(components) {
  if (!Array.isArray(components)) return [];
  
  return components.map(component => {
    const cleaned = {
      id: component.id,
      type: component.type || component.category, // PageRenderer uses 'type'
      container: component.container,
      position: component.position,
      props: {
        title: component.title || component.props?.title,
        style: component.props?.style || {}
      }
    };
    
    // Preserve workflow triggers - they're functional logic, not metadata bloat
    if (component.workflowTriggers && Object.keys(component.workflowTriggers).length > 0) {
      cleaned.workflowTriggers = component.workflowTriggers;
    }
    
    // Add other essential props if they exist
    if (component.flex) cleaned.flex = component.flex;
    if (component.width) cleaned.width = component.width;
    if (component.span) cleaned.span = component.span;
    
    // Recursively clean nested components
    if (component.components && component.components.length > 0) {
      cleaned.components = cleanComponentsForRendering(component.components);
    }
    
    // Remove any undefined/null values to keep config clean
    return Object.fromEntries(
      Object.entries(cleaned).filter(([_, value]) => value !== undefined && value !== null)
    );
  });
}

/**
 * Clean page-level properties for PageRenderer
 */
export function cleanPageProperties(eventType) {
  const pageConfig = {
    layout: eventType.layout || "flex",
    components: cleanComponentsForRendering(eventType.components || [])
  };

  // Include page-level properties that PageRenderer might need
  const pageProps = ['title', 'routePath', 'purpose', 'cluster'];
  pageProps.forEach(prop => {
    if (eventType[prop]) pageConfig[prop] = eventType[prop];
  });

  // Include page-level workflow triggers if they exist
  if (eventType.workflowTriggers && Object.keys(eventType.workflowTriggers).length > 0) {
    pageConfig.workflowTriggers = eventType.workflowTriggers;
  }

  return pageConfig;
}