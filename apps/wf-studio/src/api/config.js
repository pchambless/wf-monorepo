/**
 * Studio API Configuration
 * Maps endpoint names to their HTTP configurations
 */

export const API_ENDPOINTS = {
  execApps: "/api/studio/apps",
  execPages: "/api/studio/pages",
  execTemplates: "/api/studio/templates",
  execEventTypes: "/api/studio/eventTypes",
  execGenPageConfig: "/api/studio/genPageConfig",
  fetchParams: "/api/eventType/params",
  getDoc: "/api/getDoc"
};

/**
 * Get endpoint URL
 */
export function getEndpointUrl(endpointName) {
  const url = API_ENDPOINTS[endpointName];
  if (!url) {
    throw new Error(`Unknown API endpoint: ${endpointName}`);
  }
  return url;
}