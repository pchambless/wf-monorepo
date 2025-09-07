/**
 * Server-side Page Configuration Generator (Refactored)
 * Simple wrapper around modular pageConfig system
 */

import { genPageConfig as generatePageConfig } from './pageConfig/index.js';

// Re-export the refactored function to maintain API compatibility
export { generatePageConfig as genPageConfig };