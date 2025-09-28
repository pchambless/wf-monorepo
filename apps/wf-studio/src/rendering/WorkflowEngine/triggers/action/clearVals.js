/**
 * Clear values in context store via shared-imports API
 */
export async function clearVals(content, context) {
  const { clearVals } = await import('@whatsfresh/shared-imports');

  // Format content for API call
  let paramNames = [];

  if (typeof content === 'string') {
    paramNames = content.includes(',') ? content.split(',').map(p => p.trim()) : [content];
  } else if (Array.isArray(content)) {
    paramNames = content;
  } else if (content?.params) {
    paramNames = Array.isArray(content.params) ? content.params : [content.params];
  }

  return await clearVals(paramNames);
}