/**
 * Shared API functionality for WhatsFresh event-driven architecture
 * @module api
 */

import { execEvent as execEventFn } from "./execEvent.js";
import { execCreateDoc as execCreateDocFn } from "./execCreateDoc.js";
import { execDml as execDmlFn } from "./execDml.js";
import { execDmlWithRefresh as execDmlWithRefreshFn } from "./execDmlWithRefresh.js";
import { setVals as setValsFn } from "./setVals.js";
import { getVal as getValFn } from "./getVal.js";
import { clearVals as clearValsFn } from "./clearVals.js";
import { userLogin as userLoginFn } from "./userLogin.js";
import {
  logImpact as logImpactFn,
  logBatchImpacts as logBatchImpactsFn,
  getRecentImpacts as getRecentImpactsFn,
  getBatchImpacts as getBatchImpactsFn,
  logFileCreate as logFileCreateFn,
  logFileModify as logFileModifyFn,
  logFileDelete as logFileDeleteFn,
} from "./logImpact.js";
// Note: FileImpactLogger is server-only (uses Node.js fs module)
// Import from './server.js' if needed in Node.js environment

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

  const boundExecCreateDoc = (params) => execCreateDocFn(params, config);

  const boundExecDml = (operation, data = {}) =>
    execDmlFn(operation, data, config);

  const boundExecDmlWithRefresh = (operation, data = {}, listEvent = null) =>
    execDmlWithRefreshFn(operation, data, listEvent, {
      ...config,
      execDml: boundExecDml,
      execEvent: boundExecEvent,
    });

  const boundSetVals = (values) => setValsFn(values, config);

  const boundGetVal = (paramName, format) =>
    getValFn(paramName, format, config);

  const boundClearVals = (paramNames) => clearValsFn(paramNames, config);

  const boundUserLogin = (loginData) => userLoginFn(loginData, config);

  const boundLogImpact = (impactData) => logImpactFn(impactData, config);

  const boundLogBatchImpacts = (impacts, planId = 1) =>
    logBatchImpactsFn(impacts, planId, config);

  const boundGetRecentImpacts = (hours = 24) =>
    getRecentImpactsFn(hours, config);

  const boundGetBatchImpacts = (batchId) => getBatchImpactsFn(batchId, config);

  const boundLogFileCreate = (filePath, description, affectedApps = []) =>
    logFileCreateFn(filePath, description, affectedApps, config);

  const boundLogFileModify = (filePath, description, affectedApps = []) =>
    logFileModifyFn(filePath, description, affectedApps, config);

  const boundLogFileDelete = (filePath, description, affectedApps = []) =>
    logFileDeleteFn(filePath, description, affectedApps, config);

  return {
    execEvent: boundExecEvent,
    execCreateDoc: boundExecCreateDoc,
    execDml: boundExecDml,
    execDmlWithRefresh: boundExecDmlWithRefresh,
    setVals: boundSetVals,
    getVal: boundGetVal,
    clearVals: boundClearVals,
    userLogin: boundUserLogin,
    logImpact: boundLogImpact,
    logBatchImpacts: boundLogBatchImpacts,
    getRecentImpacts: boundGetRecentImpacts,
    getBatchImpacts: boundGetBatchImpacts,
    logFileCreate: boundLogFileCreate,
    logFileModify: boundLogFileModify,
    logFileDelete: boundLogFileDelete,
    // Note: File-based logging (FileImpactLogger) is server-only
    // Import from '@whatsfresh/shared-imports/server' if needed
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
  setVals,
  getVal,
  clearVals,
  userLogin,
  logImpact,
  logBatchImpacts,
  getRecentImpacts,
  getBatchImpacts,
  logFileCreate,
  logFileModify,
  logFileDelete,
} = api;

// Note: FileImpactLogger, createSession, addFile* functions are server-only
// Create a separate server.js entry point if these are needed
