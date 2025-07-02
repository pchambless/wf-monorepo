/**
 * Unified routes export for shared-config
 * Re-exports client routes by default, with optional admin routes
 */

// Export client routes as default
export {
  ROUTES,
  resolveRoute,
  getRouteKeyByEvent
} from './client/routes.js';

// Also need to export missing functions referenced in index.js
import { ROUTES as CLIENT_ROUTES } from './client/routes.js';

/**
 * Get route by listEvent - alternative name for getRouteKeyByEvent
 */
export function getRoute(listEvent) {
  return Object.entries(CLIENT_ROUTES).find(([_, route]) => 
    route.listEvent === listEvent
  )?.[1] || null;
}

/**
 * Get navigation sections for the client app
 */
export function getNavSections() {
  // This should return navigation structure based on available routes
  const sections = [];
  
  // Group routes by entity type
  const routeGroups = {};
  
  Object.entries(CLIENT_ROUTES).forEach(([key, route]) => {
    if (route.listEvent && route.listEvent !== 'dashboard') {
      // Extract entity type from listEvent (e.g., 'ingrTypeList' -> 'ingredient')
      const entityType = route.listEvent.replace(/List$/, '').toLowerCase();
      const groupName = getGroupName(entityType);
      
      if (!routeGroups[groupName]) {
        routeGroups[groupName] = [];
      }
      
      routeGroups[groupName].push({
        key,
        route,
        label: getDisplayLabel(entityType),
        eventType: route.listEvent
      });
    }
  });
  
  // Convert groups to sections
  Object.entries(routeGroups).forEach(([groupName, routes]) => {
    sections.push({
      title: groupName,
      items: routes
    });
  });
  
  return sections;
}

/**
 * Map entity types to display groups
 */
function getGroupName(entityType) {
  const groupMap = {
    'ingrtype': 'Ingredients',
    'ingr': 'Ingredients', 
    'ingrbatch': 'Ingredients',
    'prodtype': 'Products',
    'prod': 'Products',
    'prodbatch': 'Products',
    'rcpe': 'Recipes',
    'meas': 'Measurements',
    'acct': 'Accounts',
    'user': 'Users',
    'vndr': 'Vendors',
    'wrkr': 'Workers',
    'task': 'Tasks',
    'brnd': 'Brands'
  };
  
  return groupMap[entityType] || 'Other';
}

/**
 * Get display label for entity type
 */
function getDisplayLabel(entityType) {
  const labelMap = {
    'ingrtype': 'Ingredient Types',
    'ingr': 'Ingredients',
    'ingrbatch': 'Ingredient Batches', 
    'prodtype': 'Product Types',
    'prod': 'Products',
    'prodbatch': 'Product Batches',
    'rcpe': 'Recipes',
    'meas': 'Measurements',
    'acct': 'Accounts',
    'user': 'Users',
    'vndr': 'Vendors',
    'wrkr': 'Workers',
    'task': 'Tasks',
    'brnd': 'Brands'
  };
  
  return labelMap[entityType] || entityType;
}

// Export SECTIONS constant
export const SECTIONS = getNavSections();
