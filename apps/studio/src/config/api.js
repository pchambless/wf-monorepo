/**
 * API Configuration for Studio App
 * 
 * Self-contained config - no shared-imports dependency
 * Respects REACT_APP_API_BASE_URL environment variable
 */

/**
 * Get the API base URL from environment or default to localhost:3001
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
};

/**
 * Create a full API URL from a path
 * @param {string} path - The API path (e.g., '/api/execEvent')
 * @returns {string} The full URL
 */
export const createApiUrl = (path) => {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
