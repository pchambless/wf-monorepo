/**
 * Shared Services Index
 * Export all reusable services for the WhatsFresh monorepo
 */

// Document management services (Plan 0018 Phase 3)
export {
  registerDocument,
  checkDocumentExists,
  getRegisteredDocuments,
  updateDocumentStatus,
  linkDocumentToPlan,
  batchRegisterDocuments,
} from "./documentService.js";

// TODO: Add other shared services here as they're created
// Example future services:
// export { default as authService } from './authService.js';
// export { default as notificationService } from './notificationService.js';
// export { default as cacheService } from './cacheService.js';
