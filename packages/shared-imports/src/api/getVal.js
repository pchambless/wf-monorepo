import { getDefaultUserEmail } from './getDefaultUserEmail.js';

/**
 * Get a single value from context store via API
 */
export async function getVal(paramName, format = 'raw', { baseUrl, logger }) {
  try {
    logger.debug(`Getting context value: ${paramName}`);

    const params = new URLSearchParams({ paramName });
    if (format !== 'raw') {
      params.append('format', format);
    }

    // Gateway will inject userEmail from session - no hardcoded email needed

    const response = await fetch(`${baseUrl}/api/getVal?${params}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    logger.error(`getVal Error for ${paramName}:`, error);
    throw error;
  }
}