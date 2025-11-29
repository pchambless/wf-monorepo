/**
 * User Email Injection Middleware
 * Automatically injects userEmail into requests based on origin port
 *
 * Port Mapping:
 * - :3004 � studio@whatsfresh.ai
 * - :3000 � whatsfresh@whatsfresh.ai
 * - :3003 � planner@whatsfresh.ai
 * - default � default@whatsfresh.ai
 */

import logger from '../utils/logger.js';

const codeName = '[userEmailInjection]';

export const injectUserEmail = (req, res, next) => {
  // Skip if userEmail already provided in request (body, query, or header from Gateway)
  if (req.body?.userEmail || req.query?.userEmail || req.headers['x-user-email']) {
    next();
    return;
  }

  const origin = req.headers.origin || req.headers.referer || '';

  // Determine userEmail based on origin port
  let userEmail = 'default@whatsfresh.ai';

  if (origin.includes(':3004')) {
    userEmail = 'studio@whatsfresh.ai';
  } else if (origin.includes(':3000')) {
    userEmail = 'whatsfresh@whatsfresh.ai';
  } else if (origin.includes(':3003')) {
    userEmail = 'planner@whatsfresh.ai';
  }

  // Inject into request body for POST/PUT/PATCH
  if (req.body && typeof req.body === 'object') {
    req.body.userEmail = userEmail;
  }

  // Inject into query for GET/DELETE
  if (req.query && typeof req.query === 'object') {
    req.query.userEmail = userEmail;
  }

  logger.debug(`${codeName} Injected userEmail: ${userEmail} for ${req.method} ${req.path}`);

  next();
};
