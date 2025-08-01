/**
 * Shared Utilities Index
 * Export all reusable utilities for the WhatsFresh monorepo
 */

// Logger utilities
export {
  default as createLogger,
  configureLogger,
  getLoggerConfig,
  systemLogger,
  debugLogger,
  errorLogger,
} from "./logger.js";

// Document metadata utilities (Plan 0018 Phase 3)
export {
  extractPlanId,
  extractTitle,
  determineDocumentType,
  generateFallbackTitle,
  parseDocumentMetadata,
  PLAN_ID_PATTERNS,
} from "./documentMetadata.js";

// File Operations utilities
// Browser-safe: Uses API endpoints for document creation
// Server-side: Import from '@whatsfresh/shared-imports/utils/server' for direct file operations

// Re-export API version for browser compatibility
export { execCreateDoc as createDoc } from "../api/index.js";

// Browser-safe stubs for other file operations (use API endpoints)
export const writeFile = () => {
  throw new Error(
    "writeFile is server-side only. Use execCreateDoc() for document creation or import from @whatsfresh/shared-imports/utils/server for server usage."
  );
};

export const fileExists = () => {
  throw new Error(
    "fileExists is server-side only. Import from @whatsfresh/shared-imports/utils/server for server usage."
  );
};

// TODO: Add other shared utilities here as they're created
// Example future utilities:
// export { default as apiClient } from './apiClient.js';
// export { default as validation } from './validation.js';
// export { default as storage } from './storage.js';
// export { default as formatters } from './formatters.js';

/**
 * Utility to check if we're running in browser vs Node.js
 */
export const isBrowser = typeof window !== "undefined";
export const isNode = typeof process !== "undefined" && process.versions?.node;

/**
 * Simple debounce utility
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Simple deep clone utility
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Wait/sleep utility for async functions
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Navigation utilities
export { createNavigationService, useAppNavigation } from "./navigation.js";

// DML utilities moved to /api/dml/ - import directly from there instead
