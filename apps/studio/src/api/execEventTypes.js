/**
 * Execute Studio EventTypes Discovery via studio API
 */

/**
 * Fetch eventTypes for a specific app and page
 * @param {string} appID - App name (required)
 * @param {string} pageID - Page name (optional, defaults to 'all')
 * @param {object} config - API configuration 
 * @returns {Promise} API response with eventTypes grouped by category
 */
export async function execEventTypes(appID, pageID = 'all', config = {}) {
  const { baseUrl = "http://localhost:3001", logger = console } = config;
  
  try {
    if (!appID) {
      logger.warn('execEventTypes requires appID parameter');
      return { success: false, rows: {}, meta: { error: 'Missing appID' } };
    }

    const url = `${baseUrl}/api/studio/eventTypes/${appID}/${pageID}`;
    logger.debug('🚀 Studio API: Fetching eventTypes from', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Failed to fetch eventTypes'}`);
    }
    
    logger.debug(`✅ Studio API: EventTypes loaded for ${appID}/${pageID}`, data);
    return data;
    
  } catch (error) {
    logger.error('❌ Studio API: execEventTypes failed:', error);
    return {
      success: false,
      rows: {},
      meta: { error: error.message }
    };
  }
}