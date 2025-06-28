const fs = require('fs').promises;
const path = require('path');
const { entityRegistry } = require('@whatsfresh/shared-config/src/client/pageMapRegistry');
const { CLIENT_EVENTS, getClientSafeEventTypes } = require('@whatsfresh/shared-events');

/**
 * Generate routes.js file using routePath from eventTypes
 */
async function generateRoutes() {
  const routes = {};
  const events = getClientSafeEventTypes();
  
  // Start with static routes
  routes.DASHBOARD = {
    path: "/dashboard",
    listEvent: "dashboard"
  };
  
  // 1. Process events with routePath first
  events.forEach(event => {
    if (event.routePath) {
      // Get the route key based on event type
      const routeKey = getRouteKeyForEvent(event.eventType);
      
      routes[routeKey] = {
        path: event.routePath,
        listEvent: event.eventType
      };
    }
  });
  
  // 2. Fill in any remaining routes from entityRegistry (for things not in events)
  Object.entries(entityRegistry).forEach(([entityName, config]) => {
    // Skip entities without a routeKey or already processed
    if (!config.routeKey || routes[config.routeKey]) return;
    
    // Special cases only - no need to build paths
    if (config.type === 'authForm' || config.type === 'widget') {
      if (config.routeKey === 'LOGIN') {
        routes.LOGIN = {
          path: '/login',
          listEvent: 'userLogin'
        };
      }
      
      if (config.routeKey === 'SELECT_ACCOUNT') {
        routes.SELECT_ACCOUNT = {
          path: '/select-account',
          listEvent: 'userAcctList'
        };
      }
    }
  });
  
  // Generate the file content
  const fileContent = `/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from event type routePaths
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
    path.join(__dirname, '../../../../../shared-config/src/routes.js'), 
    fileContent
  );
  
  console.log('Routes file generated successfully!');
}

/**
 * Map eventType to route key
 */
function getRouteKeyForEvent(eventType) {
  // Direct mappings for events with non-standard keys
  const specialCases = {
    "userLogin": "LOGIN",
    "userAcctList": "SELECT_ACCOUNT"
  };
  
  if (specialCases[eventType]) {
    return specialCases[eventType];
  }
  
  // Standard conversion: ingrTypeList -> INGREDIENT_TYPES
  return eventType
    .replace(/List$/, '') // Remove "List" suffix
    .replace(/([A-Z])/g, '_$1') // Add underscore before capital letters
    .toUpperCase() // Convert to uppercase
    .replace(/^_/, ''); // Remove leading underscore if present
}

module.exports = {
  generateRoutes
};

// Allow running directly
if (require.main === module) {
  generateRoutes().catch(console.error);
}