/**
 * @fileoverview File Operations Module - Main Entry Point
 *
 * Modular file creation utility with security validation and error handling.
 * Provides secure document creation with directory auto-creation, path validation,
 * and comprehensive error handling for the WhatsFresh monorepo.
 *
 * @module FileOperations
 * @version 1.0.0
 * @author WhatsFresh Development Team
 * @since 2025-01-25
 */

import createLogger from "../logger.js";
import { validateInputs, validateFileName } from "./validation.js";
import { validateSecurity } from "./security.js";
import { ensureDirectory, getDirectoryPath } from "./directory.js";
import { fileExists } from "./backup.js";
import { writeFile } from "./writer.js";
import { createErrorResponse } from "./errors.js";

const logger = createLogger("FileOperations");

/**
 * @typedef {Object} CreateDocSuccessResponse
 * @property {true} success - Operation succeeded
 * @property {string} fullPath - Absolute path to created file
 * @property {string} message - Success message
 * @property {boolean} [wasOverwrite] - Whether an existing file was overwritten
 */

/**
 * @typedef {Object} CreateDocErrorResponse
 * @property {false} success - Operation failed
 * @property {string} error - Technical error message
 * @property {string} message - User-friendly error message
 * @property {string} code - Error categorization code (VALIDATION_ERROR, SECURITY_ERROR, etc.)
 */

/**
 * @typedef {CreateDocSuccessResponse | CreateDocErrorResponse} CreateDocResponse
 */

/**
 * Create document with directory auto-creation and security validation
 *
 * This is the main function for creating documents in the WhatsFresh monorepo.
 * It provides comprehensive validation, security checks, automatic directory creation,
 * and UTF-8 file writing with detailed error handling.
 *
 * **Security Features:**
 * - Path traversal prevention (blocks ../, ..\, etc.)
 * - Project boundary enforcement (files must be within project directory)
 * - Filename validation (alphanumeric, dash, underscore, dot only)
 * - File extension validation (only allowed extensions)
 * - Reserved name detection (Windows system files)
 *
 * **File Operations:**
 * - Recursive directory creation
 * - UTF-8 encoding for all text files
 * - Overwrite detection with logging
 * - Atomic file writing to prevent corruption
 *
 * @param {string} filePath - Directory path (relative or absolute).
 *   Examples: './docs', 'src/components', '/absolute/path/within/project'
 * @param {string} fileName - File name with extension. Must contain only alphanumeric
 *   characters, dashes, underscores, and dots. Examples: 'readme.md', 'component.jsx', 'config.json'
 * @param {string} content - File content to write. Must be a valid UTF-8 string.
 *   Maximum size: 10MB
 *
 * @returns {CreateDocResponse} Response object with success status and details
 *
 * @throws {never} This function never throws - all errors are returned in the response object
 *
 * @example
 * // Basic usage - Create a simple markdown file
 * import { createDoc } from '@whatsfresh/shared-imports/utils';
 *
 * const result = createDoc('./docs', 'readme.md', '# My Project\n\nThis is a test.');
 * if (result.success) {
 *   console.log('✅ Created:', result.fullPath);
 *   console.log('📝 Message:', result.message);
 * } else {
 *   console.error('❌ Failed:', result.message);
 *   console.error('🔍 Error:', result.error);
 *   console.error('🏷️  Code:', result.code);
 * }
 *
 * @example
 * // Advanced usage - Create document with nested directories
 * const result = createDoc(
 *   './docs/guides/setup',
 *   'installation.md',
 *   `# Installation Guide
 *
 * ## Prerequisites
 * - Node.js 18+
 * - npm or yarn
 *
 * ## Steps
 * 1. Clone the repository
 * 2. Install dependencies
 * 3. Run the application`
 * );
 *
 * @example
 * // Error handling - Handle different error types
 * const result = createDoc('../../../etc', 'passwd', 'malicious');
 * if (!result.success) {
 *   switch (result.code) {
 *     case 'SECURITY_ERROR':
 *       console.log('🔒 Security violation blocked');
 *       break;
 *     case 'VALIDATION_ERROR':
 *       console.log('📝 Input validation failed');
 *       break;
 *     case 'PERMISSION_ERROR':
 *       console.log('🚫 Permission denied');
 *       break;
 *     default:
 *       console.log('❓ Unknown error occurred');
 *   }
 * }
 *
 * @example
 * // Batch document creation
 * const documents = [
 *   { path: './docs', name: 'readme.md', content: '# README' },
 *   { path: './docs/api', name: 'endpoints.md', content: '# API Endpoints' },
 *   { path: './docs/guides', name: 'setup.md', content: '# Setup Guide' }
 * ];
 *
 * const results = documents.map(doc =>
 *   createDoc(doc.path, doc.name, doc.content)
 * );
 *
 * const successful = results.filter(r => r.success);
 * const failed = results.filter(r => !r.success);
 *
 * console.log(`✅ Created ${successful.length} documents`);
 * console.log(`❌ Failed ${failed.length} documents`);
 *
 * @since 1.0.0
 */
export function createDoc(filePath, fileName, content) {
  logger.debug("createDoc called", {
    filePath,
    fileName,
    contentLength: content?.length,
  });

  try {
    // Step 1: Validate inputs
    validateInputs(filePath, fileName, content);

    // Step 2: Validate filename
    validateFileName(fileName);

    // Step 3: Validate security and get full path
    const fullPath = validateSecurity(filePath, fileName);

    // Step 4: Ensure directory exists
    const directoryPath = getDirectoryPath(fullPath);
    ensureDirectory(directoryPath);

    // Step 5: Check if file exists and warn (MVP approach - no backup)
    const willOverwrite = fileExists(fullPath);
    if (willOverwrite) {
      logger.warn(`Overwriting existing file: ${fullPath}`);
    }

    // Step 6: Write file
    writeFile(fullPath, content);

    // Success response
    const response = {
      success: true,
      fullPath,
      message: `Document created successfully: ${fullPath}`,
    };

    logger.info("Document created successfully", {
      fullPath,
      contentLength: content.length,
      wasOverwrite: willOverwrite,
    });

    return response;
  } catch (error) {
    return createErrorResponse(error, { filePath, fileName });
  }
}

// Export both named and default export for flexibility
export default createDoc;

/**
 * @namespace AdvancedUtilities
 * @description Advanced utilities for custom file operations and validation.
 * These functions are used internally by createDoc but can also be used
 * independently for specialized use cases.
 */

/**
 * Validate input parameters for file operations
 * @memberof AdvancedUtilities
 * @function validateInputs
 * @param {string} filePath - Directory path to validate
 * @param {string} fileName - File name to validate
 * @param {string} content - Content to validate
 * @throws {Error} If validation fails
 * @example
 * import { validateInputs } from '@whatsfresh/shared-imports/utils';
 * try {
 *   validateInputs('./docs', 'readme.md', '# Content');
 *   console.log('✅ Inputs are valid');
 * } catch (error) {
 *   console.error('❌ Validation failed:', error.message);
 * }
 */

/**
 * Validate filename against security constraints
 * @memberof AdvancedUtilities
 * @function validateFileName
 * @param {string} fileName - File name to validate
 * @throws {Error} If filename validation fails
 * @example
 * import { validateFileName } from '@whatsfresh/shared-imports/utils';
 * validateFileName('valid-file_name.md'); // ✅ Passes
 * validateFileName('invalid<file>.md');   // ❌ Throws error
 */

/**
 * Validate path security to prevent traversal attacks
 * @memberof AdvancedUtilities
 * @function validateSecurity
 * @param {string} filePath - Directory path to validate
 * @param {string} fileName - File name to validate
 * @returns {string} Resolved absolute path
 * @throws {Error} If security validation fails
 */

/**
 * Resolve and normalize file path with validation
 * @memberof AdvancedUtilities
 * @function resolvePath
 * @param {string} filePath - Directory path to resolve
 * @returns {Object} Resolved path information
 */

/**
 * Ensure directory exists, creating it recursively if needed
 * @memberof AdvancedUtilities
 * @function ensureDirectory
 * @param {string} dirPath - Directory path to ensure exists
 * @throws {Error} If directory creation fails
 * @example
 * import { ensureDirectory } from '@whatsfresh/shared-imports/utils';
 * ensureDirectory('./docs/guides/setup'); // Creates nested directories
 */

/**
 * Check if directory exists
 * @memberof AdvancedUtilities
 * @function directoryExists
 * @param {string} dirPath - Directory path to check
 * @returns {boolean} True if directory exists
 */

/**
 * Create backup of existing file (for future use)
 * @memberof AdvancedUtilities
 * @function createBackup
 * @param {string} filePath - Path to file to backup
 * @returns {string|null} Path to backup file, or null if no backup needed
 * @throws {Error} If backup creation fails
 */

/**
 * Check if file exists
 * @memberof AdvancedUtilities
 * @function fileExists
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file exists
 * @example
 * import { fileExists } from '@whatsfresh/shared-imports/utils';
 * if (fileExists('./docs/readme.md')) {
 *   console.log('📄 File exists');
 * }
 */

/**
 * Write content to file with UTF-8 encoding
 * @memberof AdvancedUtilities
 * @function writeFile
 * @param {string} filePath - Full path to file
 * @param {string} content - Content to write
 * @throws {Error} If file writing fails
 */

/**
 * Error type constants for categorizing file operation errors
 * @memberof AdvancedUtilities
 * @constant {Object} ERROR_TYPES
 * @property {string} VALIDATION_ERROR - Input validation failed
 * @property {string} SECURITY_ERROR - Security constraint violation
 * @property {string} PERMISSION_ERROR - File system permission denied
 * @property {string} DISK_ERROR - Disk space or I/O error
 * @property {string} DIRECTORY_ERROR - Directory operation failed
 * @property {string} WRITE_ERROR - File writing failed
 * @example
 * import { ERROR_TYPES } from '@whatsfresh/shared-imports/utils';
 * if (result.code === ERROR_TYPES.SECURITY_ERROR) {
 *   console.log('🔒 Security violation detected');
 * }
 */

/**
 * Categorize error based on error message
 * @memberof AdvancedUtilities
 * @function categorizeError
 * @param {Error} error - Error object to categorize
 * @returns {string} Error category code
 */

// Re-export utilities for advanced usage
export { validateInputs, validateFileName } from "./validation.js";
export { validateSecurity, resolvePath } from "./security.js";
export { ensureDirectory, directoryExists } from "./directory.js";
export { createBackup, fileExists } from "./backup.js";
export { writeFile } from "./writer.js";
export { ERROR_TYPES, categorizeError } from "./errors.js";
