/**
 * Get user email for context_store operations
 * Centralized function to determine which email to use
 *
 * Priority:
 * 1. req.body.userEmail - API/automation calls (Claude, Kiro, external)
 * 2. req.session?.userEmail - Logged-in user from Studio UI
 * 3. req.headers['x-user-email'] - API Gateway injected user
 *
 * If none found, throws an error to force proper authentication
 *
 * @param {Object} req - Express request object
 * @returns {string} User email
 * @throws {Error} If no valid userEmail is found
 */
export function getUserEmail(req) {
  const userEmail = req.body?.userEmail || req.session?.userEmail || req.headers['x-user-email'];

  if (!userEmail) {
    throw new Error('No userEmail found in request. Must provide userEmail in body or have valid session.');
  }

  return userEmail;
}

export default getUserEmail;
