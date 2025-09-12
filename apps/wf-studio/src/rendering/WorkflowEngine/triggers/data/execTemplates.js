/**
 * Execute Templates Discovery via studio API
 */
export async function execTemplates() {
  try {
    const { execTemplates } = await import('../../../../api/index.js');
    return await execTemplates();
  } catch (error) {
    console.error('❌ execTemplates failed:', error);
    return { table: "studio_templates", rows: [] };
  }
}