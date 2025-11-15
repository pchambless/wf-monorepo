import { getDefaultUserEmail } from './getDefaultUserEmail.js';

/**
 * Execute an event type against the API
 */
export async function execEvent(xrefId, params = {}, { baseUrl, logger }) {
  try {
    logger.debug(`Executing event xrefId: ${xrefId}`, params);

    const headers = {
      "Content-Type": "application/json",
    };

    // TEMPORARY HARDCODE - bypassing env var issues
    const body = { eventSQLId: xrefId, params };
    body.userEmail = 'studio@whatsfresh.ai';

    // Call the execEvent endpoint with credentials
    // Server expects eventSQLId parameter
    const response = await fetch(`${baseUrl}/api/execEvent`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify(body),
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
    logger.error(`Event Error: xrefId ${xrefId}`, error);
    throw error;
  }
}