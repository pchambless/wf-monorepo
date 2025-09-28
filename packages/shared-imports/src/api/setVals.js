/**
 * Set multiple values in context store via API
 */
export async function setVals(values, { baseUrl, logger }) {
  try {
    logger.debug(`Setting ${values.length} context values`, values);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/api/setVals`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ values }),
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