/**
 * Execute Generate Page Config
 */
export async function execGenPageConfig(appID, pageID, config = {}) {
  try {
    const { baseUrl, logger } = config;
    
    if (!appID || !pageID) {
      logger?.warn('⚠️ execGenPageConfig: Missing appID or pageID');
      return { error: 'Missing required parameters' };
    }

    const url = `${baseUrl}/api/studio/genPageConfig/${appID}/${pageID}`;
    logger?.log('🔄 execGenPageConfig:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    logger?.log('✅ execGenPageConfig success:', result);
    return result;
    
  } catch (error) {
    const errorMsg = `❌ execGenPageConfig failed: ${error.message}`;
    config?.logger?.error(errorMsg);
    return { error: error.message };
  }
}