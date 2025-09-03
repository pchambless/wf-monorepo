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

/**
 * Auto-discover eventTypes from page folder structure
 */
async function discoverEventTypes(app, page) {
  const eventTypes = [];
  const { promises: fs } = await import('fs');
  const { join } = await import('path');
  
  // Add page eventType
  eventTypes.push({
    eventType: `${page.toLowerCase()}Page`,
    category: 'page',
    title: `${page} Designer`,
    layout: 'three-column'
  });
  
  try {
    const pageFolder = `./src/eventTypes/${app}/pages/${page}`;
    console.log(`🔍 Scanning ${pageFolder} for eventTypes...`);
    
    // Check if page folder exists
    try {
      await fs.access(pageFolder);
    } catch {
      console.log(`⚠️ Page folder ${pageFolder} not found, using basic page eventType only`);
      return eventTypes;
    }
    
    // Recursively scan for .js files
    async function scanFolder(folderPath, relativePath = '') {
      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(folderPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanFolder(fullPath, join(relativePath, entry.name));
        } else if (entry.name.endsWith('.js')) {
          // Import .js files
          const importPath = join(folderPath, entry.name);
          console.log(`📄 Found eventType: ${importPath}`);
          
          try {
            const module = await import(importPath);
            // Get all exports from the module
            Object.values(module).forEach(exportedItem => {
              if (exportedItem && typeof exportedItem === 'object' && exportedItem.eventType) {
                eventTypes.push(exportedItem);
                console.log(`✅ Imported: ${exportedItem.eventType}`);
              }
            });
          } catch (error) {
            console.error(`❌ Failed to import ${importPath}:`, error);
          }
        }
      }
    }
    
    await scanFolder(pageFolder);
    
  } catch (error) {
    console.error(`❌ Error scanning eventTypes for ${app}/${page}:`, error);
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
    
    // Generate pageConfig
    const outputPath = `./src/pages/${page}/pageConfig.json`;
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