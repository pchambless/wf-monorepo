import { getSafeEventTypes } from '@whatsfresh/shared-imports/events';

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

  // Always ensure LOGIN route exists
  routes.LOGIN = {
    path: "/login",
    listEvent: "userLogin"
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

// Create entityRegistry for backward compatibility
export const entityRegistry = {};
const events = getSafeEventTypes();
events.forEach(event => {
  if (event.routePath) {
    entityRegistry[event.eventType] = {
      routeKey: getRouteKeyForEvent(event.eventType),
      eventType: event.eventType,
      category: event.category,
      cluster: event.cluster,
      import: event.category?.includes('page:') || false
    };
  }
});

// Create sections for navigation
export const SECTIONS = {};
events.forEach(event => {
  if (event.routePath && event.cluster) {
    if (!SECTIONS[event.cluster]) {
      SECTIONS[event.cluster] = {
        name: event.cluster,
        order: getClusterOrder(event.cluster),
        items: []
      };
    }

    SECTIONS[event.cluster].items.push({
      routeKey: getRouteKeyForEvent(event.eventType),
      eventType: event.eventType,
      title: getDisplayTitle(event.eventType),
      category: event.category,
      order: event.eventID || 999
    });
  }
});

function getClusterOrder(cluster) {
  const orderMap = {
    'AUTH': 1,
    'INGREDIENTS': 2,
    'PRODUCTS': 3,
    'REFERENCE': 4,
    'MAPPING': 5
  };
  return orderMap[cluster] || 999;
}

function getDisplayTitle(eventType) {
  return eventType
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/List$/, 's');
}

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

export function getNavSections() {
  return Object.values(SECTIONS).sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getRoute(routeKey) {
  return ROUTES[routeKey];
}

export function getRouteByEventType(eventType) {
  return Object.values(ROUTES).find(route => route.listEvent === eventType);
}

// Check a few conversions
console.log(getRouteKeyForEvent('ingrTypeList')); // Should output: INGREDIENT_TYPES
console.log(getRouteKeyForEvent('prodBtchList')); // Should output: PRODUCT_BATCHES
console.log(getRouteKeyForEvent('measList'));     // Should output: MEASURES

// Check that all current routes are covered
const generatedRoutes = getRoutes();
console.log('Generated routes:', Object.keys(generatedRoutes).length);
