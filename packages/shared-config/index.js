// Export common routes
export { ROUTES } from './src/routes.js';

// Client specific routes
export { ROUTES as CLIENT_ROUTES } from './src/client/routes.js';

// Admin specific routes 
export { ROUTES as ADMIN_ROUTES } from './src/admin/routes.js';

// Export pageMapRegistry for both admin and client
export * from './src/admin/pageMapRegistry.js';
export * from './src/client/pageMapRegistry.js';
