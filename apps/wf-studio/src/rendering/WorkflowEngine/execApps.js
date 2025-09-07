/**
 * Execute Studio Apps API call via shared-imports
 */
export async function execApps() {
  try {
    const { execApps } = await import('@whatsfresh/shared-imports');
    return await execApps();
  } catch (error) {
    console.error('❌ execApps failed:', error);
    return { table: "studio_apps", rows: [] };
  }
}