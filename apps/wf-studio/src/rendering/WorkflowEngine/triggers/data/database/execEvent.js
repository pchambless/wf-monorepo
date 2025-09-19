/**
 * Execute database eventType via shared-imports with xrefId
 */
export async function execEvent(xrefId, params = {}) {
  const { execEvent } = await import('@whatsfresh/shared-imports');

  const config = {
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
    logger: console
  };

  return await execEvent(xrefId, params, config);
}