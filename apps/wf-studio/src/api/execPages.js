/**
 * Studio API - Execute Pages Discovery
 * Direct call to studioDiscovery controller with appID
 */

export async function execPages(appID, { baseUrl, logger }) {
  try {
    const url = `${baseUrl}/api/studio/pages/${appID}`;
    logger.log(`🚀 Studio API: Fetching pages from ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    logger.log(`✅ Studio API: Pages loaded for ${appID}`, data);
    
    return data;
  } catch (error) {
    logger.error(`❌ Studio API execPages Error for ${appID}:`, error);
    throw error;
  }
}