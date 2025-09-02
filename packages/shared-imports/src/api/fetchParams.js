/**
 * Fetch parameters for a specific eventType
 */
export async function fetchParams(eventTypeName, { baseUrl, logger }) {
  try {
    logger.debug(`Fetching params for eventType: ${eventTypeName}`);

    const response = await fetch(`${baseUrl}/api/eventType/${eventTypeName}/params`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return result.params || [];
  } catch (error) {
    logger.error(`Fetch Params Error: ${eventTypeName}`, error);
    throw error;
  }
}