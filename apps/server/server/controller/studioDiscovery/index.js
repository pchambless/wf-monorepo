/**
 * Studio Discovery Controller - Modular Index
 * Exports all discovery modules for clean separation of concerns
 */

export { discoverApps } from './discoverApps.js';
export { discoverPages } from './discoverPages.js';
export { discoverTemplates } from './discoverTemplates.js';
export { discoverEventTypes } from './discoverEventTypes.js';

// Legacy exports from main studioDiscovery.js - keep for backward compatibility
export { discoverStructure, genPageConfig } from '../studioDiscovery.js';