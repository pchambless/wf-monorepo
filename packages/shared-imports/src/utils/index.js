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

// File operations utilities (Plan 0019 - Document Automation)
export {
  createDoc,
  default as createDocDefault,
  validateInputs,
  validateFileName,
  validateSecurity,
  resolvePath,
  ensureDirectory,
  directoryExists,
  fileExists,
  writeFile,
  ERROR_TYPES,
  categorizeError,
} from "./fileOperations.js";

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
