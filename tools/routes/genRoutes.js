const fs = require('fs').promises;
const path = require('path');
const { entityRegistry } = require('../../packages/shared-config/src/pageMapRegistry');

/**
 * Generate ultra-minimal routes.js file with listEvent included
 */
async function generateRoutes() {
  // Build minimal routes object
  const routes = {};
  
  // Process each entity in registry
  Object.entries(entityRegistry).forEach(([entityName, config]) => {
    // Skip entities without a routeKey
    if (config.routeKey === null) return;
    
    // Generate appropriate path based on entity relationships
    let path = '';
    let requiredParams = [];
    
    // Special cases for AUTH and DASHBOARD
    if (config.pageType === 'dashboard') {
      path = '/dashboard';
    } else if (config.pageType === 'authForm' || config.pageType === 'widget') {
      if (config.routeKey === 'LOGIN') path = '/login';
      if (config.routeKey === 'SELECT_ACCOUNT') path = '/select-account';
    } 
    // Standard CRUD routes
    else {
      const section = config.section;
      
      // Reference items
      if (section === 'reference') {
        path = `/account/:acctID/${entityName.replace('List', '').toLowerCase()}s`;
        requiredParams = ['acctID'];
      } 
      // Ingredients/Products top level (Types)
      else if ((section === 'ingredients' || section === 'products') && 
               config.parentIdField === 'acctID' && !config.parentEntity) {
        path = `/${section}/:acctID/types`;
        requiredParams = ['acctID'];
      }
      // Child entities
      else if (config.parentEntity && config.parentIdField) {
        // Second-level entities (under types)
        if (section === 'ingredients' && config.routeKey === 'INGREDIENTS') {
          path = `/ingredients/:${config.parentIdField}/ingredients`;
          requiredParams = ['acctID', config.parentIdField];
        } 
        else if (section === 'products' && config.routeKey === 'PRODUCTS') {
          path = `/products/:${config.parentIdField}/products`;
          requiredParams = ['acctID', config.parentIdField];
        }
        // Third-level entities (batches)
        else if (section === 'ingredients' && config.routeKey === 'INGREDIENT_BATCHES') {
          path = `/ingredients/:${config.parentIdField}/batches`;
          requiredParams = ['acctID', 'ingrTypeID', config.parentIdField];
        }
        else if (section === 'products' && config.routeKey === 'PRODUCT_BATCHES') {
          path = `/products/:${config.parentIdField}/batches`;
          requiredParams = ['acctID', 'prodTypeID', config.parentIdField];
        }
        // Mapping section
        else if (section === 'maps') {
          if (config.routeKey === 'RECIPES') {
            path = `/products/:${config.parentIdField}/recipes`;
            requiredParams = [config.parentIdField];
          } else if (config.routeKey === 'BATCH_MAP') {
            path = `/products/:${config.parentIdField}/batch-map`;
            requiredParams = [config.parentIdField];
          } else if (config.routeKey === 'BATCH_TASKS') {
            path = `/products/:${config.parentIdField}/prod-type-tasks`;
            requiredParams = [config.parentIdField];
          }
        }
      }
    }
    
    // Create ultra-minimal route entry WITH listEvent
    routes[config.routeKey] = {
      path,
      listEvent: config.listEvent || entityName, // Include listEvent as crucial glue
      requiredParams: requiredParams.length > 0 ? requiredParams : undefined
    };
  });
  
  // Generate file content with helper functions
  const fileContent = `/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from pageMapRegistry.js
 */

// Route definitions - only paths, listEvents, and required params
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
  
  // Write to file - adjusted path for new folder structure
  await fs.writeFile(
    path.join(__dirname, '../../packages/shared-config/src/routes.js'), 
    fileContent
  );
  
  console.log('Routes file generated successfully!');
}

// Export the function for use in master generate.js
module.exports = {
  generateRoutes
};

// Allow running directly
if (require.main === module) {
  generateRoutes().catch(console.error);
}