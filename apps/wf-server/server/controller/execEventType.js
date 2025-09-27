import { executeQuery } from '../utils/dbUtils.js';
import { createRequestBody } from '../utils/queryResolver.js';
import { getValDirect } from './getVal.js';
import logger from '../utils/logger.js';

const codeName = `[execEventType.js]`;

/**
 * Execute SQL query from eventSQL table by eventSQL ID
 * Database-driven query execution using eventSQL architecture
 */
const execEventType = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { eventSQLId, params } = req.body;

  if (!eventSQLId) {
    return res.status(400).json({
      error: 'MISSING_EVENTSQL_ID',
      message: 'eventSQLId is required'
    });
  }

  try {
    // Fetch SQL query from eventSQL table
    const fetchSQL = `
      SELECT qryName, qrySQL, description
      FROM api_wf.eventSQL
      WHERE id = ? AND active = 1
    `;

    logger.debug(`${codeName} Fetching eventSQL with ID: ${eventSQLId}`);

    // Execute query to get the SQL from eventSQL table
    const fetchResult = await executeQuery(fetchSQL.replace('?', eventSQLId), 'GET');

    if (!fetchResult || fetchResult.length === 0) {
      return res.status(404).json({
        error: 'EVENTSQL_NOT_FOUND',
        message: `No active eventSQL found with ID: ${eventSQLId}`
      });
    }

    const eventSQLData = fetchResult[0];
    const { qryName, qrySQL } = eventSQLData;

    logger.debug(`${codeName} Found eventSQL: ${qryName}`);

    // Auto-resolve context parameters
    let finalSQL = qrySQL;
    const paramMatches = finalSQL.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);

    if (paramMatches) {
      const userEmail = params?.email || 'pc7900@gmail.com';

      for (const paramMatch of paramMatches) {
        const paramName = paramMatch.substring(1);

        try {
          const resolvedValue = await getValDirect(userEmail, paramName, 'sql');
          if (resolvedValue !== null) {
            finalSQL = finalSQL.replace(new RegExp(`:${paramName}`, 'g'), resolvedValue);
            logger.debug(`${codeName} Resolved :${paramName} → ${resolvedValue}`);
          } else {
            logger.warn(`${codeName} No context value found for parameter: ${paramName}`);
          }
        } catch (error) {
          logger.error(`${codeName} Error resolving parameter ${paramName}:`, error);
        }
      }
    }


    logger.debug(`${codeName} Executing SQL: ${finalSQL}`);

    // Execute the query using GET method
    const result = await executeQuery(finalSQL, 'GET');

    logger.info(`${codeName} EventSQL executed successfully: ${qryName} (ID: ${eventSQLId})`);

    res.json({
      qryName: qryName,
      eventSQLId: eventSQLId,
      data: result
    });

  } catch (error) {
    logger.error(`${codeName} EventSQL execution failed for ID ${eventSQLId}:`, error);

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || 'EVENTSQL_EXECUTION_FAILED',
      message: error.message,
      eventSQLId: eventSQLId
    });
  }
};

export default execEventType;
