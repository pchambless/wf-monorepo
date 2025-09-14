/**
 * Execute Generate Page Config
 */
export async function execGenPageConfig(params, config = {}) {
  try {
    const { baseUrl, logger } = config;
    
    if (!params || !params[':appID'] || !params[':pageID']) {
      logger?.warn('⚠️ execGenPageConfig: Missing appID or pageID parameters');
      return { error: 'Missing required parameters' };
    }

    const url = `${baseUrl}/api/studio/genPageConfig`;
    const requestBody = { params };
    logger?.log('🔄 execGenPageConfig:', url, { params });
    logger?.log('📦 execGenPageConfig request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
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