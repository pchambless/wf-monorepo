/**
 * Get parameter from contextStore
 */
export async function getVal(action, data) {
  if (!this.contextStore) {
    throw new Error('ContextStore not initialized');
  }
  
  const paramName = action.param;
  const value = this.contextStore.getVal(paramName);
  console.log(`📖 Get ${paramName} = ${value}`);
  return value;
}