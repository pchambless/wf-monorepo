/**
 * Execute a DML operation
 */
export async function execDml(operation, data = {}, { baseUrl, logger }) {
  try {
    logger.debug(`Executing DML: ${operation}`, data);

    const headers = {
      "Content-Type": "application/json",
    };

    // Call the DML endpoint with credentials (for session-based auth)
    const response = await fetch(`${baseUrl}/api/execDML`, {
      method: "POST",
      headers,
      credentials: "include", // Important for session cookies
      body: JSON.stringify(data), // Send the DML payload directly
    });

    if (!response.ok) {
      const error = new Error(
        `DML Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    logger.error(`DML Error: ${operation}`, error);
    throw error;
  }
}