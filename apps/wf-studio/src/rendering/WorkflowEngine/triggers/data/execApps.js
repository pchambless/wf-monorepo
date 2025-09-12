/**
 * Execute Studio Apps Discovery via studio API
 */
export async function execApps() {
  const { execApps } = await import('../../../../api/index.js');
  return await execApps(); // execApps is already bound with config
}