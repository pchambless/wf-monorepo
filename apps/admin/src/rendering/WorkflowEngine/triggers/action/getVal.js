/**
 * Get parameter from context store via shared-imports API
 */
export async function getVal(content, context) {
  const { getVal } = await import('../../../../utils/api.js');

  // Format content for API call
  const paramName = typeof content === 'string' ? content : content.paramName;
  const format = content.format || 'raw';

  const result = await getVal(paramName, format);

  // Return data tied to the component that requested it
  const returnValue = {
    componentId: context.componentId,
    data: { [paramName]: result.resolvedValue }
  };

  console.log('📦 getVal returning:', returnValue);
  return returnValue;
}