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

    // TEMPORARY HARDCODE - bypassing env var issues
    params.append('userEmail', 'studio@whatsfresh.ai');

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