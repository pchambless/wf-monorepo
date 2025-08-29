/**
 * EventType Discovery - Bulletproof filesystem-based loading
 * Uses webpack's require.context to automatically discover all eventType files
 * Includes manual refresh for development edge cases
 */

let EVENT_TYPE_REGISTRY = null;

/**
 * Discover and load all eventTypes using webpack's require.context
 * This scans the filesystem at build-time, no manual config needed
 */
function loadAllEventTypes() {
  console.log('🔍 Discovering eventTypes from filesystem...');
  
  // Webpack magic: scan all .js files in eventTypes directory
  const eventTypeContext = require.context('../eventTypes', true, /\.js$/);
  
  const eventTypeRegistry = {};
  let loadedCount = 0;
  
  // Process each discovered file
  eventTypeContext.keys().forEach(filePath => {
    // Parse path: ./plans/pages/PlanManager/forms/formPlan.js
    const pathParts = filePath.replace('./', '').replace('.js', '').split('/');
    
    if (pathParts.length >= 5) {
      const [app, pagesFolder, page, category, eventTypeName] = pathParts;
      
      // Initialize nested structure
      if (!eventTypeRegistry[app]) eventTypeRegistry[app] = {};
      if (!eventTypeRegistry[app][page]) eventTypeRegistry[app][page] = {};
      if (!eventTypeRegistry[app][page][category]) eventTypeRegistry[app][page][category] = {};
      
      try {
        // Load the actual module
        const moduleExports = eventTypeContext(filePath);
        const eventTypeData = moduleExports[eventTypeName];
        
        if (eventTypeData) {
          eventTypeRegistry[app][page][category][eventTypeName] = eventTypeData;
          loadedCount++;
          console.log(`✅ Loaded: ${app}/${page}/${category}/${eventTypeName}`);
        } else {
          console.warn(`⚠️ No export found for ${eventTypeName} in ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load eventType from ${filePath}:`, error);
      }
    } else {
      console.warn(`⚠️ Invalid eventType path structure: ${filePath}`);
    }
  });
  
  console.log(`🎉 EventType discovery complete: ${loadedCount} eventTypes loaded`);
  return eventTypeRegistry;
}

/**
 * Initialize registry - called once at module load
 */
function initializeRegistry() {
  if (!EVENT_TYPE_REGISTRY) {
    EVENT_TYPE_REGISTRY = loadAllEventTypes();
  }
  return EVENT_TYPE_REGISTRY;
}

/**
 * Manual refresh for development - call after file operations
 */
export function refreshEventTypeRegistry() {
  console.log('🔄 Refreshing eventType registry...');
  EVENT_TYPE_REGISTRY = loadAllEventTypes();
  return EVENT_TYPE_REGISTRY;
}

/**
 * Get eventType data by name - works with contextStore
 */
export function getEventType(eventTypeName, app = 'plans', page = 'PlanManager') {
  const registry = initializeRegistry();
  
  // Determine category from name
  let category = 'components';
  if (eventTypeName.startsWith('form')) category = 'forms';
  else if (eventTypeName.startsWith('grid')) category = 'grids';
  else if (eventTypeName.startsWith('tab')) category = 'tabs';
  else if (eventTypeName.startsWith('btn') || eventTypeName.startsWith('select')) category = 'widgets';
  else if (eventTypeName.startsWith('page')) category = 'pages';
  
  const eventTypeData = registry[app]?.[page]?.[category]?.[eventTypeName];
  
  if (!eventTypeData) {
    const available = getAvailableEventTypes(app, page);
    const availableList = Object.entries(available)
      .flatMap(([cat, items]) => Object.keys(items).map(name => `${cat}/${name}`))
      .join(', ');
    
    throw new Error(`EventType '${eventTypeName}' not found in ${app}/${page}. Available: ${availableList || 'none'}`);
  }
  
  console.log(`📋 Retrieved eventType: ${eventTypeName}`, eventTypeData);
  return eventTypeData;
}

/**
 * Get all available eventTypes for an app/page
 */
export function getAvailableEventTypes(app, page) {
  const registry = initializeRegistry();
  if (!app || !page) return registry;
  return registry[app]?.[page] || {};
}

/**
 * Get registry status and debugging info
 */
export function getRegistryInfo() {
  const registry = initializeRegistry();
  
  const totalEventTypes = Object.values(registry)
    .flatMap(app => Object.values(app))
    .flatMap(page => Object.values(page))
    .flatMap(category => Object.keys(category))
    .length;
    
  const structure = {};
  Object.entries(registry).forEach(([app, pages]) => {
    structure[app] = {};
    Object.entries(pages).forEach(([page, categories]) => {
      structure[app][page] = {};
      Object.entries(categories).forEach(([category, eventTypes]) => {
        structure[app][page][category] = Object.keys(eventTypes);
      });
    });
  });
    
  return {
    apps: Object.keys(registry),
    totalEventTypes,
    structure,
    registry
  };
}

/**
 * Check if eventType exists without loading it
 */
export function eventTypeExists(eventTypeName, app = 'plans', page = 'PlanManager') {
  try {
    getEventType(eventTypeName, app, page);
    return true;
  } catch {
    return false;
  }
}

// Initialize on module load
initializeRegistry();