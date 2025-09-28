/**
 * User login authentication via API
 */
export async function userLogin(loginData, { baseUrl, logger }) {
  try {
    logger.debug('userLogin: Starting authentication', { userEmail: loginData.userEmail });

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = new Error(
        `Login Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    logger.error('userLogin Error:', error);
    throw error;
  }
}