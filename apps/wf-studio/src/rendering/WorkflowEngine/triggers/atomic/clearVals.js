/**
 * Clear values in contextStore - dynamically invoked method
 */
export async function clearVals(action, context) {
  const params = action.params || [];
  
  if (!this.contextStore) {
    console.error('❌ ContextStore not available for clearVals');
    return;
  }
  
  console.log(`🧹 Clearing values:`, params);
  this.contextStore.clearVals(...params);
}