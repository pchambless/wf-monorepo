/**
 * Execute an event type against the API
 */
export async function execEvent(eventType, params = {}, { baseUrl, logger }) {
  try {
    logger.debug(`Executing event: ${eventType}`, params);

    const headers = {
      "Content-Type": "application/json",
    };

    // Call the execEventType endpoint with credentials
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