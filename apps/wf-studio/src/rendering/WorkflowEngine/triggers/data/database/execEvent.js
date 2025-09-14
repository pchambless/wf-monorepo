/**
 * Execute database eventType via shared-imports
 */
export async function execEvent(eventName, data = {}) {
  const { execEvent } = await import('@whatsfresh/shared-imports');
  return await execEvent(eventName, data);
}