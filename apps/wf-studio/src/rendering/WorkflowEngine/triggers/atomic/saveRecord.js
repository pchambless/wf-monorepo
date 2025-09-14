/**
 * Execute save operation via execEvent
 */
export async function saveRecord(action, data) {
  if (!action.qry) {
    throw new Error('saveRecord requires qry parameter');
  }

  try {
    const result = await this.execEvent(action.qry, data);
    console.log(`💾 Saved record via ${action.qry}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Save failed for ${action.qry}:`, error);
    throw error;
  }
}