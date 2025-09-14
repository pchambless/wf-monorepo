/**
 * Clear values in contextStore - dynamically invoked method
 */
export async function clearVals(action, context) {
  let params = action.params || [];
  
  if (!this.contextStore) {
    console.error('❌ ContextStore not available for clearVals');
    return;
  }
  
  // Ensure params is an array
  if (!Array.isArray(params)) {
    console.warn('⚠️ clearVals params is not an array:', params);
    params = [];
  }
  
  console.log(`🧹 Clearing values:`, params);
  this.contextStore.clearVals(...params);
}