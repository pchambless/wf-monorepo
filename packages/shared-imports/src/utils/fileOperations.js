/**
 * File Operations Utility for WhatsFresh Monorepo
 * Provides secure document creation with directory auto-creation and validation
 *
 * Usage:
 *   import { createDoc } from '@whatsfresh/shared-imports/utils';
 *   const result = createDoc('./docs', 'example.md', '# Hello World');
 *   if (result.success) {
 *     console.log('Document created:', result.fullPath);
 *   }
 */

// Re-export everything from the enhanced implementation with impact tracking
export {
  createDoc,
  modifyDoc,
  createDocBatch,
  default,
  validateInputs,
  validateFileName,
  validateSecurity,
  resolvePath,
  ensureDirectory,
  directoryExists,
  createBackup,
  fileExists,
  writeFile,
  ERROR_TYPES,
  categorizeError,
  createDocWithoutTracking,
} from "./fileOperations/indexWithTracking.js";
