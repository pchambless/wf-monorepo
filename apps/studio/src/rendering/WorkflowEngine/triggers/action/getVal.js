/**
 * Get parameter from context store via shared-imports API
 */
export async function getVal(content, context) {
  const { getVal } = await import('../../../../utils/api.js');

  // Format content for API call
  const paramName = typeof content === 'string' ? content : content.paramName;
  const format = content.format || 'raw';

  const result = await getVal(paramName, format);
  return result.resolvedValue;
}