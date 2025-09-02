/**
 * Generic Page Configuration Generator
 * Takes eventTypes and generates pageConfig.json for any page
 */

import { execCreateDoc } from '@whatsfresh/shared-imports/api';

/**
 * Build component hierarchy from eventTypes
 * @param {Object[]} eventTypes - Array of eventType objects
 * @returns {Object} Root page component with full hierarchy
 */
function buildComponentHierarchy(eventTypes) {
  // Find the root page component
  const pageComponent = eventTypes.find(et => et.category === 'page');
  if (!pageComponent) {
    throw new Error('No page-level eventType found');
  }
  
  // Create lookup map for all eventTypes by ID
  const eventTypeMap = {};
  eventTypes.forEach(et => {
    const id = et.eventType || et.id;
    if (id) {
      eventTypeMap[id] = et;
    }
  });
  
  // Recursively build hierarchy
  function attachComponents(component) {
    if (component.components && Array.isArray(component.components)) {
      component.components = component.components.map(child => {
        const childEventType = eventTypeMap[child.id] || eventTypeMap[child.eventType];
        
        if (childEventType) {
          const enhancedChild = {
            ...childEventType,
            id: child.id,
            position: child.position,
            props: { ...(childEventType.props || {}), ...(child.props || {}) }
          };
          
          return attachComponents(enhancedChild);
        }
        
        return child;
      });
    }
    
    return component;
  }
  
  return attachComponents({ ...pageComponent });
}

/**
 * Generic pageConfig generator
 * @param {Object[]} eventTypes - Array of eventType objects
 * @param {string} outputPath - Where to save pageConfig.json
 * @returns {Object} Generated pageConfig
 */
export async function genPageConfig(eventTypes, outputPath) {
  console.log(`🔍 Generating pageConfig with ${eventTypes.length} eventTypes`);
  
  if (!eventTypes || eventTypes.length === 0) {
    throw new Error('No eventTypes provided');
  }
  
  // Build hierarchy
  const rootComponent = buildComponentHierarchy(eventTypes);
  
  // Generate pageConfig
  const pageConfig = {
    generated: new Date().toISOString(),
    source: "genPageConfig.js",
    eventTypeCount: eventTypes.length,
    ...rootComponent,
    meta: {
      discoveredEventTypes: eventTypes.map(et => ({
        id: et.eventType || et.id,
        category: et.category,
        title: et.title,
        hasComponents: !!(et.components && et.components.length),
        hasFields: !!(et.fields && et.fields.length)
      }))
    }
  };
  
  // Save via API
  const pathParts = outputPath.split('/');
  const fileName = pathParts.pop();
  const targetPath = pathParts.join('/');
  
  const result = await execCreateDoc({
    targetPath,
    fileName,
    content: JSON.stringify(pageConfig, null, 2)
  });
  
  console.log('💾 Generated pageConfig:', result);
  return pageConfig;
}