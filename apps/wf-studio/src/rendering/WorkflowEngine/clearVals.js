/**
 * Clear values in contextStore - dynamically invoked method
 */
export async function clearVals(action, context) {
  const targets = action.targets || [];
  
  if (!context.contextStore) {
    console.error('❌ ContextStore not available for clearVals');
    return;
  }
  
  console.log(`🧹 Clearing values:`, targets);
  context.contextStore.clearVals(...targets);
}