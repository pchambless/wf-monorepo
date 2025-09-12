/**
 * Execute Generate Page Config via studio API
 */
export async function execGenPageConfig(action, data) {
  try {
    const { execGenPageConfig } = await import('../../../../api/index.js');
    
    // Extract appID and pageID from action params or data
    const { appID, pageID } = action.params || data;
    
    if (!appID || !pageID) {
      console.warn('⚠️ execGenPageConfig: Missing appID or pageID');
      return { error: 'Missing required parameters' };
    }
    
    return await execGenPageConfig(appID, pageID);
  } catch (error) {
    console.error('❌ execGenPageConfig failed:', error);
    return { error: error.message };
  }
}