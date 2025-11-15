import { createLogger } from '@whatsfresh/shared-imports';
import { useCallback } from 'react';
import { getSafeEventTypes } from '@whatsfresh/shared-imports/events';

const log = createLogger('API');

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Core API call function with improved error handling
 */
const callApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      log.error(`API Error: ${endpoint} - ${response.status} ${response.statusText}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    log.debug(`API call: ${endpoint}`);
    return data;
  } catch (error) {
    log.error(`API Error: ${endpoint}`, { error: error.message });
    throw error;
  }
};

/**
 * Execute an event type against the API
 */
export const execEvent = async (eventType, params = {}) => {
  try {
    log.debug(`Execute: ${eventType}`, { params });

    const response = await callApi('/api/execEvent', {
      method: 'POST',
      body: JSON.stringify({ eventType, params })
    });

    log.debug(`Response received for ${eventType}`);

    if (!Array.isArray(response) && typeof response !== 'object') {
      log.warn(`Unexpected response type from ${eventType}:`, typeof response);
    }

    return response;
  } catch (error) {
    log.error(`Error: ${eventType}`, { error: error.message });
    throw error;
  }
};

/**
 * Get client-safe event types directly from the package
 * Made synchronous since it's accessing data from an imported package
 */
export const fetchEventList = () => {
  log.debug('Using client-safe event types from shared-events package');
  return getSafeEventTypes('client');
};

/**
 * Hook for API access from components
 */
export const useApi = () => {
  const apiExecEvent = useCallback(async (eventType, additionalParams = {}) => {
    try {
      return await execEvent(eventType, additionalParams);
    } catch (error) {
      log.error(`Error executing event type ${eventType}:`, error);
      throw error;
    }
  }, []);

  return {
    execEvent: apiExecEvent,
    fetchEventList
  };
};

/**
 * Simple stub for future DML request execution
 * Uses the requestBody parameter to satisfy linting rules
 */
export const execDmlRequest = async (requestBody) => {
  log.info('DML request stub called', {
    requestType: requestBody?.type || 'unknown',
    entityCount: requestBody?.entities?.length || 0
  });

  // Return a mock response that includes some info from the requestBody
  return {
    success: true,
    message: `DML request preview for ${requestBody?.type || 'unknown operation'}`,
    data: {
      preview: true,
      affectedEntities: requestBody?.entities?.length || 0,
      timestamp: new Date().toISOString()
    }
  };
};

// Use named exports instead of default export for better IDE support and imports
export { execEvent as default };








