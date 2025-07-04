// App-aware configuration export
// Provides clean imports for both client and admin configurations

// Export common configurations (shared between all apps)
export { abbreviationMap } from './src/common/abbreviationMap.js';
export { directiveMap } from './src/common/directiveMap.js';

// Export global routes (if they exist at the root level)
export { ROUTES, SECTIONS, getNavSections, getRoute, resolveRoute } from './src/routes.js';

// Export app-specific configurations with explicit naming
// Client exports
export * as client from './src/client/index.js';

// Admin exports  
export * as admin from './src/admin/index.js';

// Convenience function to get app-specific config
export function getAppConfig(appName = 'client') {
  const APP_NAME = appName || process.env.APP_NAME || 'client';
  
  if (APP_NAME === 'admin') {
    return import('./src/admin/index.js');
  } else {
    return import('./src/client/index.js');
  }
}

console.log('[shared-config] Static exports loaded - use client.* or admin.* or getAppConfig()');