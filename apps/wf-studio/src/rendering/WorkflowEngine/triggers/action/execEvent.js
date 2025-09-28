/**
 * Execute database eventType via shared-imports
 */
export async function execEvent(content, context) {
  const { execEvent } = await import('@whatsfresh/shared-imports');

  // Format content for API call
  const xrefId = typeof content === 'string' ? parseInt(content) : content;
  const params = context || {};

  return await execEvent(xrefId, params);
}