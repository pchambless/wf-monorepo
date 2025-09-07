/**
 * Set parameter in contextStore
 */
export async function setVal(action, data) {
  if (!this.contextStore) {
    console.error('❌ ContextStore not available for setVal');
    return;
  }

  const param = action.param;
  const value = data.value || data;

  if (!param) {
    console.error('❌ setVal requires param field');
    return;
  }

  console.log(`🔄 Setting context: ${param} = ${value}`);
  this.contextStore.setVal(param, value);
}