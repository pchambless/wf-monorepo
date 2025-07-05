/**
 * WhatsFresh Shared Imports Package - Main Export (JS only)
 * 
 * This file exports only JavaScript utilities and functions.
 * For JSX components, use '@whatsfresh/shared-imports/jsx'
 * 
 * Usage:
 * import { execEvent, createLogger, buildDMLData } from '@whatsfresh/shared-imports';
 * import { LoginForm, CrudLayout, Modal } from '@whatsfresh/shared-imports/jsx';
 */

import React from 'react';

// === SHARED EVENTS EXPORTS ===
export * from '../../shared-events/index.js';

// === SHARED API EXPORTS ===
// Use server-safe exports to avoid JSX parsing issues in Node.js
export * from '../../shared-api/src/server.js';

// === UTILITIES FROM THIS PACKAGE ===
export * from './utils/index.js';
export { default as createLogger } from './utils/logger.js';

// === SHARED UI EXPORTS (JavaScript utilities only) ===
export {
  WIDGET_REGISTRY,
  WIDGET_TYPES,
  WIDGET_SIZES,
  getWidgetById,
  getWidgetsByApp,
  getWidgetDisplayName
} from '../../shared-ui/src/widgets/index.js';

// Export DML utilities (non-JSX parts only)
export {
  buildDMLData,
  buildSQLPreview
} from '../../shared-ui/src/utils/dml/dmlBuilder.js';

// === DEVTOOLS UTILITIES ===
// Note: pageMapAccess.js excluded from browser builds (Node.js only)
// Available via direct import: '@whatsfresh/shared-imports/devtools/pageMapAccess'

// === LEGACY DYNAMIC IMPORT SUPPORT ===
// Note: imports.js and paths.js excluded from browser exports (use Node.js modules)
// These are available for build tools that import directly from those files

// === STUB IMPLEMENTATIONS FOR MISSING DEPENDENCIES ===
// These are temporary stubs to get the app compiling
// They should be replaced with proper implementations or removed

// === TEMPORARY STUBS FOR JSX COMPONENTS ===
// These are temporary stubs until webpack config is fixed
// Use '@whatsfresh/shared-imports/jsx' for actual JSX components (once webpack is configured)
// For now, we'll import real components directly from shared-ui in client code
// export const LoginForm = () => null;
export const LoginView = () => null;
export const CrudLayout = () => null;
export const Modal = () => null;
export const useModalStore = () => ({ isOpen: false, close: () => { } });
export const modalStore = { isOpen: false, close: () => { } };
export const SelAcct = ({ selectedAccountId, accounts, onChange, loading, size }) => {
  // Temporary debug - return simple string to test if this is causing the React error
  console.log('SelAcct called with:', { selectedAccountId, accounts, loading, size });
  return 'Account Selector (Debug)';
};

export function initEventTypeService() {
  console.log('initEventTypeService stub called');
  return Promise.resolve(true);
}

export function isEventTypeServiceInitialized() {
  console.log('isEventTypeServiceInitialized stub called');
  return true;
}

export const accountStore = {
  setUserLoginData: (user, accounts) => {
    console.log('accountStore.setUserLoginData stub called', { user, accounts });
  },
  currentAccountId: null,
  currentUser: null
};

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