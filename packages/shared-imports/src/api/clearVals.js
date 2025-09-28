/**
 * Clear multiple values from context store via API
 */
export async function clearVals(paramNames, { baseUrl, logger }) {
  try {
    logger.debug(`Clearing ${paramNames.length} context values`, paramNames);

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/api/clearVals`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ paramNames }),
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
    logger.error(`clearVals Error:`, error);
    throw error;
  }
}