/**
 * DML (Data Manipulation Language) API
 * Clean export interface for all DML functionality
 */

// Main DML operations
export {
  executeDML,
  insertRecord,
  updateRecord,
  deleteRecord,
  previewDML,
  buildDMLData,
  buildSQLPreview
} from './operations.js';

// SQL formatting utilities
export * from './sqlFormatter.js';