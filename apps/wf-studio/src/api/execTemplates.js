/**
 * Studio API - Execute Templates Discovery
 * Direct call to studioDiscovery controller for template discovery
 */

export async function execTemplates({ baseUrl, logger }) {
  try {
    const url = `${baseUrl}/api/studio/templates`;
    logger.log(`🚀 Studio API: Fetching templates from ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    logger.log(`✅ Studio API: Templates loaded`, data);
    
    return data;
  } catch (error) {
    logger.error('❌ Studio API execTemplates Error:', error);
    throw error;
  }
}