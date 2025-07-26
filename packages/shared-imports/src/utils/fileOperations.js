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

// Re-export everything from the modular implementation
export {
  createDoc,
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
} from "./fileOperations/index.js";
