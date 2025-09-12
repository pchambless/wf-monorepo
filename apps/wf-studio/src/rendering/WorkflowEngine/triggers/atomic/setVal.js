/**
 * Set parameter in contextStore
 */
export async function setVal(action, data) {
  if (!this.contextStore) {
    console.error('❌ ContextStore not available for setVal');
    return;
  }

  const param = action.param;
  let value = action.value;

  if (!param) {
    console.error('❌ setVal requires param field');
    return;
  }

  // Handle template values like "{{selected.value}}"
  if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
    const template = value.slice(2, -2); // Remove {{ and }}
    
    if (template === 'selected.value') {
      value = data.value;
    } else if (template === 'selected.item') {
      value = data.selectedItem;
    } else {
      console.warn(`⚠️ Unknown template: ${template}`);
      value = data.value || data; // fallback
    }
  } else if (!value) {
    // If no value specified, use data.value as fallback
    value = data.value || data;
  }

  console.log(`🔄 Setting context: ${param} = ${value}`);
  this.contextStore.setVal(param, value);
}