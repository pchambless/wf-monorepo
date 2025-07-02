/**
 * Shared API functionality for WhatsFresh event-driven architecture
 * @module api
 */

/**
 * Create an API client for WhatsFresh applications
 */
export function createApi(options = {}) {
  const {
    baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    logger = console
  } = options;

  /**
   * Execute an event type against the API
   */
  async function execEvent(eventType, params = {}) {
    try {
      logger.debug(`Executing event: ${eventType}`, params);
      
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