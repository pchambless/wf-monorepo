/**
 * Execute Studio EventTypes Discovery via studio API
 */
export async function execEventTypes() {
  try {
    const appID = this.contextStore?.getVal('appID');
    const pageID = this.contextStore?.getVal('pageID') || 'all';

    if (!appID) {
      console.warn('No appID in contextStore for execEventTypes');
      return { success: false, rows: {}, meta: { error: 'Missing appID' } };
    }

    const { execEventTypes } = await import('../../../../../api/index.js');
    return await execEventTypes(appID, pageID);
  } catch (error) {
    console.error('❌ execEventTypes failed:', error);
    return { success: false, rows: {}, meta: { error: error.message } };
  }
}