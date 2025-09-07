/**
 * Fetch Query Events API
 * Gets available database queries for a specific app
 * Used by cardDBQuery dropdown
 */

export async function fetchQueryEvents(app, { baseUrl, logger }) {
  if (!app) {
    throw new Error('App parameter is required');
  }

  try {
    logger.debug(`Fetching query events for app: ${app}`);

    const response = await fetch(`${baseUrl}/api/server/queries?app=${app}`, {
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

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch query events');
    }

    logger.debug(`Found ${data.count} queries for app '${app}':`, data.data);
    return data.data; // Returns array of { name, app }
  } catch (error) {
    logger.error(`Error fetching query events for app '${app}':`, error);
    throw error;
  }
}