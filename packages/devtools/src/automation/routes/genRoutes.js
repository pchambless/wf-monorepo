const fs = require('fs').promises;
const path = require('path');
const { entityRegistry } = require('@whatsfresh/shared-config/src/client/pageMapRegistry');
const { CLIENT_EVENTS, getParentEntity } = require('@whatsfresh/shared-events');

/**
 * Generate routes.js file based on simple, flat route structure
 */
async function generateRoutes() {
  // Build routes object
  const routes = {};
  
  // Process each entity in registry
  Object.entries(entityRegistry).forEach(([entityName, config]) => {
    // Skip entities without a routeKey
    if (!config.routeKey) return;
    
    // Generate appropriate path based on entity relationships
    let path = '';
    let params = []; // Changed from requiredParams to params for consistency
    
    // Special cases for AUTH and DASHBOARD
    if (config.type === 'dashboard') {
      path = '/dashboard';
    } else if (config.type === 'authForm' || config.type === 'widget') {
      if (config.routeKey === 'LOGIN') path = '/login';
      if (config.routeKey === 'SELECT_ACCOUNT') path = '/select-account';
    } 
    // Standard routes - simple, flat structure
    else {
      // Find corresponding event type
      const eventType = config.listEvent || entityName;
      const eventConfig = CLIENT_EVENTS.find(e => e.eventType === eventType);
      
      if (eventConfig) {
        const section = config.section;
        const pathSegments = [];
        
        // Start with section if it exists
        if (section) {
          pathSegments.push(section);
        }
        
        // Add account ID for non-mapping pages with no direct parent
        if (section !== 'maps' && (!getParentEntity(eventType) || getParentEntity(eventType) === 'acctRoot')) {
          pathSegments.push(':acctID');
          params.push('acctID'); // Using params consistently
        }
        
        // Get direct parent (not ancestors)
        const parent = getParentEntity(eventType);
        
        // If parent exists and isn't acctRoot, add parent parameter
        if (parent && parent !== 'acctRoot') {
          const parentParam = getParamName(parent);
          pathSegments.push(`:${parentParam}`);
          params.push(parentParam); // Using params consistently
          
          // For child routes, still need acctID for data access, but don't put in URL
          if (section !== 'maps') {
            params.push('acctID'); // Using params consistently
          }
        }
        
        // Add exact event name (not kebab-case)
        pathSegments.push(eventType);
        
        // Build the final path
        path = '/' + pathSegments.join('/');
      }
    }
    
    // Create route entry WITHOUT params
    routes[config.routeKey] = {
      path,
      listEvent: config.listEvent || entityName
      // params removed - client will get them from event definition
    };
  });
  
  // Generate the file content (rest of the code remains the same)
  const fileContent = `/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from event type relationships and pageMapRegistry
 */

// Route definitions with simplified structure
export const ROUTES = ${JSON.stringify(routes, null, 2)};

/**
 * Helper to resolve parameterized routes with actual values
 */
export function resolveRoute(routeKey, params = {}) {
  const route = ROUTES[routeKey];
  if (!route) {
    console.error(\`Route key not found: \${routeKey}\`);
    return '/';
  }
  
  let resolvedPath = route.path;
  Object.entries(params).forEach(([key, value]) => {
    resolvedPath = resolvedPath.replace(\`:\${key}\`, value);
  });
  return resolvedPath;
}

/**
 * Get route key by listEvent
 */
export function getRouteKeyByEvent(listEvent) {
  if (!listEvent) return null;
  
  const entry = Object.entries(ROUTES).find(([_, route]) => 
    route.listEvent === listEvent
  );
  
  return entry ? entry[0] : null;
}`;
  
  // Write to file
  await fs.writeFile(
    path.join(__dirname, '../../packages/shared-config/src/routes.js'), 
    fileContent
  );
  
  console.log('Routes file generated successfully!');
}

/**
 * Helper to get parameter name from event type
 */
function getParamName(eventType) {
  // Convert eventType to parameter name (e.g., ingrTypeList -> ingrTypeID)
  return eventType.replace(/List$/, 'ID');
}

// Export the function for use in master generate.js
module.exports = {
  generateRoutes
};

// Allow running directly
if (require.main === module) {
  generateRoutes().catch(console.error);
}