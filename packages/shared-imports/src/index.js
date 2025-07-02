/**
 * WhatsFresh Shared Imports Package
 * 
 * Provides:
 * 1. Clean import aliases (no more ../../../../)
 * 2. Shared utilities (logger, etc.)
 * 3. Centralized path resolution
 * 
 * Usage Examples:
 * 
 * // Import aliases for cleaner code:
 * import { sharedConfig, sharedUI } from '@whatsfresh/shared-imports';
 * const { entityRegistry } = await sharedConfig.client.pageMapRegistry();
 * 
 * // Shared utilities:
 * import { createLogger, debounce } from '@whatsfresh/shared-imports';
 * const log = createLogger('MyComponent');
 * 
 * // Path utilities:
 * import { packagePaths, resolvePackage } from '@whatsfresh/shared-imports/paths';
 * const configPath = resolvePackage('sharedConfig', 'client/routes.js');
 */

// Re-export everything for convenience
export * from './imports.js';
export * from './paths.js';
export * from './utils/index.js';

// Default exports for common patterns
export { default as createLogger } from './utils/logger.js';

/**
 * Package metadata
 */
export const packageInfo = {
  name: '@whatsfresh/shared-imports',
  version: '0.1.0',
  description: 'Shared utilities and import aliases for WhatsFresh monorepo'
};

/**
 * Quick setup function for apps
 */
export function setupSharedImports(options = {}) {
  const { 
    logLevel = 'info',
    showTimestamps = true,
    component = 'APP'
  } = options;
  
  // Configure logger with app-specific defaults
  import('./utils/logger.js').then(({ configureLogger }) => {
    configureLogger({
      defaultLevel: typeof logLevel === 'string' ? 
        { error: 1, warn: 2, info: 3, debug: 4 }[logLevel] : logLevel,
      showTimestamps
    });
  });
  
  // Return a pre-configured logger for the app
  return import('./utils/logger.js').then(({ default: createLogger }) => 
    createLogger(component, logLevel)
  );
}