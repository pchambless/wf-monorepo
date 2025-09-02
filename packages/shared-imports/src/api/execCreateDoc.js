/**
 * Execute parameter-driven document creation
 */
export async function execCreateDoc(params, { baseUrl, logger }) {
  try {
    logger.debug(`Creating document:`, params);

    const headers = {
      "Content-Type": "application/json",
    };

    // Call the execCreateDoc endpoint with credentials
    const response = await fetch(`${baseUrl}/api/execCreateDoc`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify(params),
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
    logger.error(`Document Creation Error:`, error);
    throw error;
  }
}