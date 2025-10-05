/**
 * Studio API - Execute Apps Discovery
 * Direct call to studioDiscovery controller
 */

export async function execApps({ baseUrl, logger }) {
  try {
    const url = `${baseUrl}/api/studio/apps`;
    logger.log(`🚀 Studio API: Fetching apps from ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    logger.log(`✅ Studio API: Apps loaded`, data);
    
    return data;
  } catch (error) {
    logger.error('❌ Studio API execApps Error:', error);
    throw error;
  }
}