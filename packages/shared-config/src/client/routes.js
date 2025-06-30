import { getSafeEventTypes } from '@whatsfresh/shared-events/src/client/eventTypes.js';

/**
 * Generate routes configuration from event types
 */
export function getRoutes() {
  const events = getSafeEventTypes();
  const routes = {};
  
  // Start with any static routes that don't directly map to events
  routes.DASHBOARD = {
    path: "/dashboard",
    listEvent: "dashboard"
  };
  
  // Process events with routePaths
  events.forEach(event => {
    if (event.routePath) {
      // Get or create the route key
      const routeKey = getRouteKeyForEvent(event.eventType);
      
      routes[routeKey] = {
        path: event.routePath,
        listEvent: event.eventType
      };
    }
  });
  
  return routes;
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

// Export static routes for direct usage
export const ROUTES = getRoutes();
console.log('Client routes:', ROUTES);

/**
 * Resolve a route with parameters
 */
export function resolveRoute(routeKey, params = {}) {
  const route = ROUTES[routeKey];
  if (!route) return '/';
  
  let path = route.path;
  Object.entries(params).forEach(([param, value]) => {
    path = path.replace(`:${param}`, value);
  });
  
  return path;
}

/**
 * Get route key for an event
 */
export function getRouteKeyByEvent(listEvent) {
  return Object.entries(ROUTES).find(([_, route]) => 
    route.listEvent === listEvent
  )?.[0] || null;
}

// Check a few conversions
console.log(getRouteKeyForEvent('ingrTypeList')); // Should output: INGREDIENT_TYPES
console.log(getRouteKeyForEvent('prodBtchList')); // Should output: PRODUCT_BATCHES
console.log(getRouteKeyForEvent('measList'));     // Should output: MEASURES

// Check that all current routes are covered
const generatedRoutes = getRoutes();
console.log('Generated routes:', Object.keys(generatedRoutes).length);