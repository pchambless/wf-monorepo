/**
 * Shared API functionality for WhatsFresh event-driven architecture
 * @module api
 */

/**
 * Default API configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  logger: console
};

/**
 * Standalone execEvent function that can be used directly
 */
export async function execEvent(eventType, params = {}, config = {}) {
  const { baseUrl, logger } = { ...DEFAULT_CONFIG, ...config };

  try {
    // Import dependencies (dynamic import to avoid circular deps)
    const { getEventType } = await import('../events/index.js');
    const { default: contextStore } = await import('../stores/contextStore.js');

    // Validate event exists in our definitions
    const eventDef = getEventType(eventType);
    if (!eventDef) {
      logger.error(`Unknown event type: ${eventType}`);
      throw new Error(`Unknown event type: ${eventType}`);
    }

    // Auto-resolve parameters using contextStore (everything is here now!)
    const autoParams = contextStore.getEventParams(eventType);
    
    // Merge auto-resolved params with manually passed params (manual takes priority)
    const mergedParams = { ...autoParams, ...params };

    logger.debug(`Executing event: ${eventType}`, { 
      autoParams, 
      manualParams: params, 
      mergedParams 
    });

    // Basic headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Call the execEventType endpoint with credentials
    const response = await fetch(`${baseUrl}/api/execEventType`, {
      method: 'POST',
      headers,
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({ eventType, params: mergedParams })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    logger.debug(`Event ${eventType} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`Event ${eventType} failed:`, error);
    throw error;
  }
}

/**
 * Create an API client for WhatsFresh applications
 */
export function createApi(options = {}) {
  const {
    baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    logger = console
  } = options;

  /**
   * Execute an event type against the API with validation
   */
  async function execEvent(eventType, params = {}) {
    try {
      logger.debug(`Executing event: ${eventType}`, params);

      // Import event validation (dynamic import to avoid circular deps)
      const { getEventType } = await import('../events/index.js');

      // Validate event exists in our definitions
      const eventDef = getEventType(eventType);
      if (!eventDef) {
        logger.error(`Unknown event type: ${eventType}`);
        throw new Error(`Unknown event type: ${eventType}`);
      }

      // Basic headers - no auth token
      const headers = {
        'Content-Type': 'application/json'
      };

      // Call the execEventType endpoint with credentials
      // This ensures cookies are sent if you're using session cookies
      const response = await fetch(`${baseUrl}/api/execEventType`, {
        method: 'POST',
        headers,
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({ eventType, params })
      });

      if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      logger.error(`Event Error: ${eventType}`, error);
      throw error;
    }
  }

  /**
   * Execute a DML operation
   */
  async function execDml(operation, data = {}) {
    try {
      logger.debug(`Executing DML: ${operation}`);

      // Get auth token if available
      const token = localStorage.getItem('authToken');

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Call the DML endpoint
      const response = await fetch(`${baseUrl}/api/dml`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: operation, ...data })
      });

      if (!response.ok) {
        const error = new Error(`DML Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      logger.error(`DML Error: ${operation}`, error);
      throw error;
    }
  }

  return {
    execEvent,
    execDml
  };
}

/**
 * Default API instance
 */
export const api = createApi();