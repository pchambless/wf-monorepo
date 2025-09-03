/**
 * Execute Studio Pages API - Get pages for specific app
 */
export async function execPages(appName, { baseUrl, logger }) {
  try {
    if (!appName) {
      throw new Error('execPages requires appName parameter');
    }

    logger.debug(`Executing Studio pages discovery for app: ${appName}`);

    const response = await fetch(`${baseUrl}/api/studio/pages/${appName}`, {
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
      throw new Error(data.message || 'Studio pages API returned error');
    }

    // Transform to standard SelectWidget format: {id, label}
    const rows = data.pages.map(page => ({ id: page, label: page }));
    
    logger.debug(`Studio pages discovered for ${appName}:`, rows);
    return { table: "studio_pages", rows };

  } catch (error) {
    logger.error(`execPages Error for ${appName}:`, error);
    throw error;
  }
}