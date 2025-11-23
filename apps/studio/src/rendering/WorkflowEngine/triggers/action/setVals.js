/**
 * Set multiple values in context store via local API
 */
export async function setVals(content, context) {
  const { setVals: setValsAPI } = await import('../../../../utils/api.js');

  console.log('🔍 setVals context keys:', Object.keys(context));
  console.log('🔍 setVals context.response:', context.response);

  // Expect array of objects: [{"key1": "val1"}, {"key2": "val2"}]
  // Each array item should have exactly ONE key-value pair
  if (!Array.isArray(content)) {
    console.error('setVals expects array format: [{"key": "value"}, ...]');
    throw new Error('setVals: content must be an array');
  }

  const values = content.map(item => {
    const entries = Object.entries(item);
    if (entries.length !== 1) {
      console.warn('setVals: each array item should have exactly one key-value pair');
    }

    const [paramName, template] = entries[0];
    const paramVal = resolveTemplate(template, context);
    console.log(`🔍 Resolved ${paramName}: ${template} -> ${paramVal}`);
    return { paramName, paramVal };
  });

  console.log('Setting', values.length, 'context values', values);
  return await setValsAPI(values);
}

/**
 * Resolve template paths like "response.user.id" or "this.value"
 */
function resolveTemplate(template, context) {
  if (typeof template === 'string' && template.startsWith('{{') && template.endsWith('}}')) {
    const pathParts = template.slice(2, -2).split('.');
    let value = context;
    for (const part of pathParts) {
      value = value?.[part];
    }
    return value !== undefined ? value : template;
  }
  return template;
}