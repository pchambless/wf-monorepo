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
  // Find the root page component with components array (the actual page structure)
  const pageComponent = eventTypes.find(et => et.category === 'page' && et.components && Array.isArray(et.components));
  if (!pageComponent) {
    // Fallback to any page component
    const fallbackPage = eventTypes.find(et => et.category === 'page');
    if (!fallbackPage) {
      throw new Error('No page-level eventType found');
    }
    console.warn('⚠️ Using page eventType without components array:', fallbackPage.eventType || fallbackPage.id);
    return fallbackPage;
  }
  
  console.log('✅ Using page eventType with components:', pageComponent.eventType || pageComponent.id, 'Components:', pageComponent.components?.length);
  
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

/**
 * Auto-discover eventTypes from page folder using API
 */
async function discoverEventTypes(app, page) {
  const eventTypes = [];
  
  // Add page eventType
  eventTypes.push({
    eventType: `${page.toLowerCase()}Page`,
    category: 'page',
    title: `${page} Designer`,
    layout: 'three-column'
  });
  
  try {
    console.log(`🔍 Fetching eventTypes for ${app}/${page} from API...`);
    
    // Fetch eventTypes from server API
    const response = await fetch(`http://localhost:3001/api/studio/eventTypes/${app}/${page}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`⚠️ No eventTypes found for ${app}/${page}, using basic page eventType only`);
        return eventTypes;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.eventTypes) {
      console.log(`⚠️ No eventTypes returned for ${app}/${page}, using basic page eventType only`);
      return eventTypes;
    }
    
    console.log(`📋 Found ${data.meta.eventTypeCount} eventTypes from API`);
    
    // Process eventTypes from API response
    Object.values(data.eventTypes).forEach(eventTypeInfo => {
      try {
        // Try to parse the eventType definition (it's stored as a string)
        let definition;
        
        // The definition might be incomplete, so let's try to parse it safely
        try {
          definition = eval(`(${eventTypeInfo.definition})`);
        } catch (evalError) {
          // If eval fails, try to create a basic object with available info
          console.warn(`⚠️ Could not parse ${eventTypeInfo.name}, creating basic eventType`);
          definition = {
            eventType: eventTypeInfo.exportName,
            category: eventTypeInfo.category,
            title: eventTypeInfo.name,
            purpose: `Generated from ${eventTypeInfo.name}`
          };
        }
        
        if (definition && typeof definition === 'object') {
          // Add metadata from API
          definition.filePath = eventTypeInfo.filePath;
          definition.category = eventTypeInfo.category;
          definition.relativePath = eventTypeInfo.relativePath;
          
          // Ensure eventType property exists
          if (!definition.eventType) {
            definition.eventType = eventTypeInfo.exportName;
          }
          
          eventTypes.push(definition);
          console.log(`✅ Loaded: ${definition.eventType} (${eventTypeInfo.category})`);
        } else {
          console.warn(`⚠️ Invalid eventType definition in ${eventTypeInfo.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to parse eventType ${eventTypeInfo.name}:`, error);
      }
    });
    
  } catch (error) {
    console.error(`❌ Error fetching eventTypes for ${app}/${page}:`, error);
    console.log(`📋 Falling back to basic page eventType only`);
  }
  
  return eventTypes;
}

/**
 * CLI interface - auto-discovers eventTypes and generates pageConfig
 */
async function runCLI() {
  const args = process.argv.slice(2);
  const appPage = args[0] || 'studio/Studio'; // Default to studio/Studio
  
  console.log(`🚀 Generating pageConfig for ${appPage}`);
  
  try {
    // Parse app/page from argument
    const [app, page] = appPage.split('/');
    
    if (!app || !page) {
      throw new Error('Usage: node genPageConfig.js <app>/<page> (e.g., studio/Studio)');
    }
    
    // Auto-discover eventTypes from page folder
    const eventTypes = await discoverEventTypes(app, page);
    
    console.log(`📋 Discovered ${eventTypes.length} eventTypes:`, eventTypes.map(et => et.eventType));
    
    // Generate pageConfig to correct Studio path
    const outputPath = `./apps/studio/src/pages/${page}/pageConfig.json`;
    await genPageConfig(eventTypes, outputPath);
    
    console.log(`✅ PageConfig generated for ${appPage}!`);
    
  } catch (error) {
    console.error('❌ CLI generation failed:', error);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}