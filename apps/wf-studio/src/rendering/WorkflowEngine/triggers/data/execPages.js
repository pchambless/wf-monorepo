/**
 * Execute Studio Pages Discovery via studio API
 */
export async function execPages() {
  try {
    const appID = this.contextStore?.getVal('appID');
    if (!appID) {
      console.warn('No appID in contextStore for execPages');
      return { table: "studio_pages", rows: [] };
    }
    
    const { execPages } = await import('../../../../api/index.js');
    return await execPages(appID);
  } catch (error) {
    console.error('❌ execPages failed:', error);
    return { table: "studio_pages", rows: [] };
  }
}