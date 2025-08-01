/**
 * Shared API functionality for WhatsFresh event-driven architecture
 * @module api
 */

/**
 * Default API configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  logger: console,
};

/**
 * Standalone execCreateDoc function for parameter-driven document creation
 */
export async function execCreateDoc(params, config = {}) {
  const { baseUrl, logger } = { ...DEFAULT_CONFIG, ...config };

  try {
    logger.debug(`Creating document:`, params);

    // Basic headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Call the execCreateDoc endpoint with credentials
    const response = await fetch(`${baseUrl}/api/execCreateDoc`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    logger.debug(`Document created successfully:`, result.resolvedFileName);
    return result;
  } catch (error) {
    logger.error(`Document creation failed:`, error);
    throw error;
  }
}

/**
 * Standalone execEvent function that can be used directly
 */
export async function execEvent(eventType, params = {}, config = {}) {
  const { baseUrl, logger } = { ...DEFAULT_CONFIG, ...config };

  try {
    // Import dependencies (dynamic import to avoid circular deps)
    const { getEventType } = await import("../events/index.js");
    const { default: contextStore } = await import("../stores/contextStore.js");

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
      mergedParams,
    });

    // Basic headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Call the execEventType endpoint with credentials
    const response = await fetch(`${baseUrl}/api/execEventType`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify({ eventType, params: mergedParams }),
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
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
    baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
    logger = console,
  } = options;

  /**
   * Execute parameter-driven document creation
   */
  async function execCreateDoc(params) {
    try {
      logger.debug(`Creating document:`, params);

      const headers = {
        "Content-Type": "application/json",
      };

      // Call the execCreateDoc endpoint with credentials
      const response = await fetch(`${baseUrl}/api/execCreateDoc`, {
        method: "POST",
        headers,
        credentials: "include", // Important for session cookies
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = new Error(
          `API Error: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      logger.error(`Document Creation Error:`, error);
      throw error;
    }
  }

  /**
   * Execute an event type against the API with validation
   */
  async function execEvent(eventType, params = {}) {
    try {
      logger.debug(`Executing event: ${eventType}`, params);

      // Import event validation (dynamic import to avoid circular deps)
      const { getEventType } = await import("../events/index.js");

      // Validate event exists in our definitions
      const eventDef = getEventType(eventType);
      if (!eventDef) {
        logger.error(`Unknown event type: ${eventType}`);
        throw new Error(`Unknown event type: ${eventType}`);
      }

      // Basic headers - no auth token
      const headers = {
        "Content-Type": "application/json",
      };

      // Call the execEventType endpoint with credentials
      // This ensures cookies are sent if you're using session cookies
      const response = await fetch(`${baseUrl}/api/execEventType`, {
        method: "POST",
        headers,
        credentials: "include", // Important for session cookies
        body: JSON.stringify({ eventType, params }),
      });

      if (!response.ok) {
        const error = new Error(
          `API Error: ${response.status} ${response.statusText}`
        );
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
      logger.debug(`Executing DML: ${operation}`, data);

      const headers = {
        "Content-Type": "application/json",
      };

      // Call the DML endpoint with credentials (for session-based auth)
      const response = await fetch(`${baseUrl}/api/execDML`, {
        method: "POST",
        headers,
        credentials: "include", // Important for session cookies
        body: JSON.stringify(data), // Send the DML payload directly
      });

      if (!response.ok) {
        const error = new Error(
          `DML Error: ${response.status} ${response.statusText}`
        );
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      logger.error(`DML Error: ${operation}`, error);
      throw error;
    }
  }

  /**
   * Execute DML operation followed by automatic table refresh (client-side)
   * @param {string} operation - DML operation type
   * @param {Object} data - DML data payload
   * @param {string} listEvent - Event to call for refresh (optional)
   * @returns {Object} Combined result with DML result and fresh table data
   */
  async function execDmlWithRefresh(operation, data = {}, listEvent = null) {
    try {
      logger.debug(`Executing DML with refresh: ${operation}`, {
        data,
        listEvent,
      });

      // Step 1: Execute the DML operation (server-side)
      const dmlResult = await execDml(operation, data);

      if (!dmlResult.success) {
        logger.error(`DML operation failed: ${operation}`, dmlResult);
        return dmlResult;
      }

      // Step 2: If successful and listEvent provided, refresh the table data (client-side)
      let refreshData = null;
      if (listEvent) {
        try {
          logger.debug(`Refreshing table data with event: ${listEvent}`);
          // Auto-resolve contextStore parameters like working fetchData() pattern
          const { default: contextStore } = await import(
            "../stores/contextStore.js"
          );
          const autoParams = contextStore.getEventParams(listEvent);
          refreshData = await execEvent(listEvent, autoParams);
          logger.debug(`Table refresh successful for: ${listEvent}`);
        } catch (refreshError) {
          logger.warn(`Table refresh failed for: ${listEvent}`, refreshError);
          // Don't fail the whole operation if refresh fails
        }
      }

      // Step 3: Return combined result
      return {
        ...dmlResult,
        refreshData,
        refreshSuccess: !!refreshData,
      };
    } catch (error) {
      logger.error(`DML with refresh failed: ${operation}`, error);
      throw error;
    }
  }

  return {
    execEvent,
    execDml,
    execDmlWithRefresh,
    execCreateDoc,
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
  execDml,
  execDmlWithRefresh,
  execCreateDoc: apiExecCreateDoc,
} = api;
