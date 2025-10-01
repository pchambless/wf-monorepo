/**
 * Execute database eventType via shared-imports
 * Content should be eventSQL ID (the query to execute)
 */
export async function execEvent(content, context) {
  const { execEvent } = await import('@whatsfresh/shared-imports');

  // Format content for API call - content is eventSQL ID
  const eventSQLId = typeof content === 'string' ? parseInt(content) : content;

  // Extract only serializable values from context (no DOM elements)
  const params = {
    formData: context.formData,
    response: context.response,
  };

  console.log('🔍 execEvent: Calling API with eventSQLId:', eventSQLId, 'params:', params);
  const result = await execEvent(eventSQLId, params);

  // Return data tied to the component that requested it
  return {
    componentId: context.componentId,  // Grid ID that triggered refresh
    data: result.data || result         // Query results
  };
}