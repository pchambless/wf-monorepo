/**
 * Fetch all eventTypes for Studio use
 */
export async function fetchStudioEventTypes(app, { baseUrl, logger }) {
  try {
    logger.debug(`Fetching Studio eventTypes for app: ${app}`);

    const response = await fetch(`${baseUrl}/api/studio/eventTypes/${app}`, {
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

    return await response.json();
  } catch (error) {
    logger.error(`Fetch Studio EventTypes Error: ${app}`, error);
    throw error;
  }
}