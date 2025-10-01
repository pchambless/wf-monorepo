/**
 * Set multiple values in context store via shared-imports API
 */
export async function setVals(content, context) {
  const { setVals: setValsAPI } = await import('@whatsfresh/shared-imports');

  console.log('🔍 setVals context keys:', Object.keys(context));
  console.log('🔍 setVals context.response:', context.response);

  // Format content for API call
  let values = [];

  if (typeof content === 'object' && content !== null) {
    // DB format: {"userID": "{{response.user.id}}", "userEmail": "{{response.user.email}}"}
    for (const [paramName, template] of Object.entries(content)) {
      const paramVal = resolveTemplate(template, context);
      console.log(`🔍 Resolved ${paramName}: ${template} -> ${paramVal}`);
      values.push({ paramName, paramVal });
    }
  } else if (typeof content === 'string' && content.includes(',')) {
    // Legacy format: "pageID,{{this.value}}"
    const [paramName, template] = content.split(',');
    const paramVal = resolveTemplate(template, context);
    values.push({ paramName, paramVal });
  }

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