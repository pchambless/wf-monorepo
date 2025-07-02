// Export all configuration from a single entry point
export { ROUTES, SECTIONS, getNavSections, getRoute, resolveRoute } from './src/routes.js';
export { navigationConfig } from './src/client/navigation.js';
export { selectorConfig } from './src/client/selectors.js';
export { abbreviationMap } from './src/common/abbreviationMap.js';

// Export pageMapRegistry
export * from './src/client/pageMapRegistry.js';