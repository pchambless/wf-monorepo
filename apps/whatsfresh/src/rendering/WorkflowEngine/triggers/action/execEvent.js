/**
 * Execute database eventType via shared-imports
 * Content can be eventSQL ID (number) or qryName (string)
 */
export async function execEvent(content, context) {
  const { execEvent } = await import('../../../../utils/api.js');

  // Content can be qryName (string) or ID (number)
  // Server will resolve either type
  const eventSQLId = content;

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