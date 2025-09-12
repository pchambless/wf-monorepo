/**
 * Studio API - Direct calls to studio discovery endpoints
 * Bypasses shared-imports to avoid cache issues
 */

import { execApps as execAppsFn } from './execApps.js';
import { execPages as execPagesFn } from './execPages.js';
import { execTemplates as execTemplatesFn } from './execTemplates.js';
import { execEventTypes as execEventTypesFn } from './execEventTypes.js';
import { execGenPageConfig as execGenPageConfigFn } from './execGenPageConfig.js';

/**
 * Default Studio API configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  logger: console,
};

/**
 * Create Studio API client
 */
export function createStudioApi(options = {}) {
  const {
    baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
    logger = console,
  } = options;

  const config = { baseUrl, logger };

  // Create bound functions with config injected
  const boundExecApps = () => 
    execAppsFn(config);
    
  const boundExecPages = (appID) => 
    execPagesFn(appID, config);
    
  const boundExecTemplates = () => 
    execTemplatesFn(config);
    
  const boundExecEventTypes = (appID, pageID) => 
    execEventTypesFn(appID, pageID, config);
    
  const boundExecGenPageConfig = (appID, pageID) => 
    execGenPageConfigFn(appID, pageID, config);

  return {
    execApps: boundExecApps,
    execPages: boundExecPages,
    execTemplates: boundExecTemplates,
    execEventTypes: boundExecEventTypes,
    execGenPageConfig: boundExecGenPageConfig,
  };
}

/**
 * Default Studio API instance
 */
export const studioApi = createStudioApi();

/**
 * Direct exports for convenience
 */
export const {
  execApps,
  execPages,
  execTemplates,
  execEventTypes,
  execGenPageConfig,
} = studioApi;