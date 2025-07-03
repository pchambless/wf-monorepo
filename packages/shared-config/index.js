// App-aware configuration export
// Uses APP_NAME environment variable to determine which config to load

const APP_NAME = process.env.APP_NAME || 'client';

// Export common configurations (shared between all apps)
export { abbreviationMap } from './src/common/abbreviationMap.js';
export { directiveMap } from './src/common/directiveMap.js';

// Export global routes (if they exist at the root level)
export { ROUTES, SECTIONS, getNavSections, getRoute, resolveRoute } from './src/routes.js';

// Export app-specific configurations
if (APP_NAME === 'admin') {
  // Admin-specific exports
  export * from './src/admin/pageMapRegistry.js';
  export { ROUTES as ADMIN_ROUTES } from './src/admin/routes.js';
  // export { navigationConfig } from './src/admin/navigation.js'; // if it exists
  
  console.log('[shared-config] Loaded admin configuration');
} else {
  // Client-specific exports (default)
  export * from './src/client/pageMapRegistry.js';
  export { navigationConfig } from './src/client/navigation.js';
  export { selectorConfig } from './src/client/selectors.js';
  export { ROUTES as CLIENT_ROUTES } from './src/client/routes.js';
  
  console.log('[shared-config] Loaded client configuration');
}