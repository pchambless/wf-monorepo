/**
 * Shared API functionality for WhatsFresh event-driven architecture
 * @module api
 */

import { execEvent as execEventFn } from './execEvent.js';
import { fetchParams as fetchParamsFn } from './fetchParams.js';
import { execCreateDoc as execCreateDocFn } from './execCreateDoc.js';
import { execDml as execDmlFn } from './execDml.js';
import { execDmlWithRefresh as execDmlWithRefreshFn } from './execDmlWithRefresh.js';
import { fetchStudioEventTypes as fetchStudioEventTypesFn } from './fetchStudioEventTypes.js';

/**
 * Default API configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  logger: console,
};

/**
 * Create an API client for WhatsFresh applications
 */
export function createApi(options = {}) {
  const {
    baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
    logger = console,
  } = options;

  const config = { baseUrl, logger };

  // Create bound functions with config injected
  const boundExecEvent = (eventType, params = {}) => 
    execEventFn(eventType, params, config);
    
  const boundFetchParams = (eventTypeName) => 
    fetchParamsFn(eventTypeName, config);
    
  const boundExecCreateDoc = (params) => 
    execCreateDocFn(params, config);
    
  const boundExecDml = (operation, data = {}) => 
    execDmlFn(operation, data, config);
    
  const boundExecDmlWithRefresh = (operation, data = {}, listEvent = null) => 
    execDmlWithRefreshFn(operation, data, listEvent, { 
      ...config, 
      execDml: boundExecDml, 
      execEvent: boundExecEvent 
    });
    
  const boundFetchStudioEventTypes = (app) => 
    fetchStudioEventTypesFn(app, config);

  return {
    execEvent: boundExecEvent,
    fetchParams: boundFetchParams,
    execCreateDoc: boundExecCreateDoc,
    execDml: boundExecDml,
    execDmlWithRefresh: boundExecDmlWithRefresh,
    fetchStudioEventTypes: boundFetchStudioEventTypes,
  };
}

/**
 * Default API instance
 */
export const api = createApi();

/**
 * Direct exports for convenience
 */
export const {
  execEvent,
  execDml,
  execDmlWithRefresh,
  execCreateDoc,
  fetchStudioEventTypes,
  fetchParams,
} = api;