/**
 * WhatsFresh Shared Imports Package - Main Export (JS only)
 *
 * This file exports only JavaScript utilities and functions.
 * For JSX components, use '@whatsfresh/shared-imports/jsx'
 * For API utilities, use '@whatsfresh/shared-imports/api'
 * For event definitions, use '@whatsfresh/shared-imports/events'
 *
 * Usage:
 * import { createLogger } from '@whatsfresh/shared-imports';
 * import { LoginForm } from '@whatsfresh/shared-imports/jsx';
 * import { apiClient } from '@whatsfresh/shared-imports/api';
 * import { eventTypes } from '@whatsfresh/shared-imports/events';
 */

import React from "react";

// Core utilities
export * from "./utils/index.js";

// Re-export commonly used utilities
export { default as createLogger } from "./utils/logger.js";

// === UTILITIES FROM THIS PACKAGE ===
export * from "./utils/index.js";

// === WIDGET UTILITIES (Placeholder - implement when needed) ===
// export {
//   WIDGET_REGISTRY,
//   WIDGET_TYPES,
//   WIDGET_SIZES,
//   getWidgetById,
//   getWidgetsByApp,
//   getWidgetDisplayName
// } from './widgets/index.js';

// === DML UTILITIES (Placeholder - implement when needed) ===
// export {
//   buildDMLData,
//   buildSQLPreview
// } from './utils/dml/dmlBuilder.js';

// === DEVTOOLS UTILITIES ===
// Note: pageMapAccess.js excluded from browser builds (Node.js only)
// Available via direct import: '@whatsfresh/shared-imports/devtools/pageMapAccess'

// === LEGACY DYNAMIC IMPORT SUPPORT ===
// Note: imports.js and paths.js excluded from browser exports (use Node.js modules)
// These are available for build tools that import directly from those files

// === STUB IMPLEMENTATIONS FOR MISSING DEPENDENCIES ===
// These are temporary stubs to get the app compiling
// They should be replaced with proper implementations or removed

// === LEGACY STUBS REMOVED ===
// Temporary JSX component stubs removed - use jsx.js for components
// Event service stubs removed - implement properly when needed

// === STORE UTILITIES ===
export {
  contextStore,
  useContextStore,
  ContextContext,
} from "./stores/index.js";

/**
 * Package metadata
 */
// === EVENT UTILITIES ===
// COMMENTED OUT: Hard-coded server imports don't work in browser
// TODO: Replace with API calls - fetchEventTypes(), fetchEventType(name), etc.
// export {
//   getClientSafeEventTypes,
//   getAdminSafeEventTypes,
//   getSafeEventTypes,
//   getEventType,
//   getEventTypes,
//   eventTypes,
// } from "../../../apps/wf-server/server/events/index.js";

// === API UTILITIES ===
export { 
  execEvent, 
  createApi, 
  api,
  execApps,
  execPages,
  execDml,
  execCreateDoc,
  fetchStudioEventTypes,
  fetchParams
} from "./api/index.js";

// === WORKFLOW UTILITIES ===
// Removed - architecture folder deleted to clean up broken dependencies

export const packageInfo = {
  name: "@whatsfresh/shared-imports",
  version: "0.1.0",
  description: "Shared utilities and import aliases for WhatsFresh monorepo",
};

/**
 * Quick setup function for apps
 */
export function setupSharedImports(options = {}) {
  const {
    logLevel = "info",
    showTimestamps = true,
    component = "APP",
  } = options;

  // Configure logger with app-specific defaults
  import("./utils/logger.js").then(({ configureLogger }) => {
    configureLogger({
      defaultLevel:
        typeof logLevel === "string"
          ? { error: 1, warn: 2, info: 3, debug: 4 }[logLevel]
          : logLevel,
      showTimestamps,
    });
  });

  // Return a pre-configured logger for the app
  return import("./utils/logger.js").then(({ default: createLogger }) =>
    createLogger(component, logLevel)
  );
}
