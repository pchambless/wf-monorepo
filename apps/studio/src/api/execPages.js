/**
 * Studio API - Execute Pages Discovery
 * Direct call to studioDiscovery controller with appID
 */

export async function execPages(params, { baseUrl, logger }) {
  try {
    if (!params || !params[':appID']) {
      throw new Error('Missing required parameter :appID');
    }
    
    const url = `${baseUrl}/api/studio/pages`;
    logger.log(`🚀 Studio API: Fetching pages from ${url}`, { params });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ params })
    });
    
    if (!response.ok) {
      // Try to extract error details from response body
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          logger.error(`❌ Server error details:`, errorData);
        }
      } catch (parseError) {
        // If response isn't JSON, use default error message
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    logger.log(`✅ Studio API: Pages loaded`, data);
    
    return data;
  } catch (error) {
    logger.error(`❌ Studio API execPages Error:`, error);
    throw error;
  }
}