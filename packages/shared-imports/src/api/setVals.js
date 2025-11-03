import { getDefaultUserEmail } from './getDefaultUserEmail.js';

/**
 * Set multiple values in context store via API
 */
export async function setVals(values, { baseUrl, logger }) {
  try {
    console.log('🔥 setVals called with:', values);
    logger.debug(`Setting ${values.length} context values`, values);

    const headers = {
      "Content-Type": "application/json",
    };

    const body = { values };

    // TEMPORARY HARDCODE - bypassing env var issues
    const defaultEmail = 'studio@whatsfresh.ai';
    console.log('🔥 HARDCODED defaultEmail:', defaultEmail);
    body.userEmail = defaultEmail;
    console.log('🔥 Body with userEmail:', body);

    const response = await fetch(`${baseUrl}/api/setVals`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
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
    logger.error(`setVals Error:`, error);
    throw error;
  }
}