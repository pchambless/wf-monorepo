/**
 * WhatsFresh Shared Imports Package
 * 
 * Centralized import hub for the entire monorepo.
 * All shared packages are re-exported here for clean, single-source imports.
 * 
 * Usage:
 * import { ROUTES, CrudLayout, execEvent, createLogger } from '@whatsfresh/shared-imports';
 */

// === SHARED CONFIG EXPORTS ===
export * from '../../shared-config/index.js';

// === SHARED UI EXPORTS ===
export * from '../../shared-ui/src/index.js';

// === SHARED EVENTS EXPORTS ===
export * from '../../shared-events/index.js';

// === SHARED API EXPORTS ===
export * from '../../shared-api/src/index.js';

// === UTILITIES FROM THIS PACKAGE ===
export * from './utils/index.js';
export { default as createLogger } from './utils/logger.js';

// === LEGACY DYNAMIC IMPORT SUPPORT ===
// Note: imports.js and paths.js excluded from browser exports (use Node.js modules)
// These are available for build tools that import directly from those files

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