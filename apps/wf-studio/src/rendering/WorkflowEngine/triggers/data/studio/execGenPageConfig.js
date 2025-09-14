/**
 * Execute Generate Page Config via studio API
 * Simple building block - expects resolved params object
 */
export async function execGenPageConfig(action, data) {
  try {
    const { execGenPageConfig } = await import('../../../../../api/index.js');

    // action.params should already be resolved to {":appID": "studio", ":pageID": "Studio"}
    const params = action.params;

    if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
      console.warn('⚠️ execGenPageConfig: Missing or invalid parameters');
      return { error: 'Missing required parameters' };
    }

    console.log('🔄 execGenPageConfig calling API with params:', params);

    return await execGenPageConfig(params);
  } catch (error) {
    console.error('❌ execGenPageConfig failed:', error);
    return { error: error.message };
  }
}