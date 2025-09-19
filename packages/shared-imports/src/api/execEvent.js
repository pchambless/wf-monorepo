/**
 * Execute an event type against the API
 */
export async function execEvent(xrefId, params = {}, { baseUrl, logger }) {
  try {
    logger.debug(`Executing event xrefId: ${xrefId}`, params);

    const headers = {
      "Content-Type": "application/json",
    };

    // Call the execEventType endpoint with credentials
    const response = await fetch(`${baseUrl}/api/execEventType`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify({ xrefId, params }),
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