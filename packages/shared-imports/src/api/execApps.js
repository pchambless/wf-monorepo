/**
 * Execute Studio Apps API - Get all apps from Studio discovery
 */
export async function execApps({ baseUrl, logger }) {
  try {
    logger.debug('Executing Studio apps discovery');

    const response = await fetch(`${baseUrl}/api/studio/apps`, {
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
      throw new Error(data.message || 'Studio apps API returned error');
    }

    // Transform to standard SelectWidget format: {id, label}
    const rows = data.apps.map(app => ({ id: app, label: app }));
    
    logger.debug('Studio apps discovered:', rows);
    return { table: "studio_apps", rows };

  } catch (error) {
    logger.error('execApps Error:', error);
    throw error;
  }
}