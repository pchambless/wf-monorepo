/**
 * Server-Only Utilities
 * Node.js utilities that use fs, path, and other server-side modules
 * DO NOT IMPORT IN BROWSER/REACT COMPONENTS
 */

// File operations utilities (Node.js only)
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

// Document workflow utilities (Node.js only)
// Note: Document workflows removed during architecture cleanup
