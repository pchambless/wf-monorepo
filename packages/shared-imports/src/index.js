/**
 * WhatsFresh Shared Imports Package - Core API and Utilities
 */

// Core utilities
export { default as createLogger } from "./utils/logger.js";

// Core API functions for trigger system
export {
  execEvent,
  createApi,
  api,
  execDml,
  execCreateDoc,
  setVals,
  getVal,
  clearVals,
  userLogin
} from "./api/index.js";

export const packageInfo = {
  name: "@whatsfresh/shared-imports",
  version: "0.1.0",
  description: "Core API and utilities for WhatsFresh trigger system",
};
