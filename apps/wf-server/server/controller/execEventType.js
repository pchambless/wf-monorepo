import { executeQuery } from '../utils/dbUtils.js';
import { createRequestBody } from '../utils/queryResolver.js';
import logger from '../utils/logger.js';

const codeName = `[execEventType.js]`;

/**
 * Execute eventType from database by xref ID
 * Database-driven replacement for file-based system
 */
const execEventType = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { xrefId, params } = req.body;

  if (!xrefId) {
    return res.status(400).json({
      error: 'MISSING_XREF_ID',
      message: 'xrefId is required'
    });
  }

  try {
    // Hardcoded query to fetch eventType from database
    const fetchSQL = `
      SELECT
        x.name as comp_name,
        e.name as template_name,
        CASE
          WHEN e.name = 'ServerQuery' THEN x.qrySQL
          ELSE x.props
        END as querySQL,
        x.props
      FROM api_wf.eventType_xref x
      JOIN api_wf.eventType e ON x.eventType_id = e.id
      WHERE x.id = ? AND x.active = 1
    `;

    logger.debug(`${codeName} Fetching eventType with xrefId: ${xrefId}`);

    // Execute hardcoded query to get the eventType
    const fetchResult = await executeQuery(fetchSQL.replace('?', xrefId), 'GET');

    if (!fetchResult || fetchResult.length === 0) {
      return res.status(404).json({
        error: 'EVENTTYPE_NOT_FOUND',
        message: `No active eventType found with xrefId: ${xrefId}`
      });
    }

    const eventTypeData = fetchResult[0];
    const { comp_name, template_name, querySQL } = eventTypeData;

    // Only execute if it's a ServerQuery (has SQL)
    if (template_name !== 'ServerQuery') {
      return res.status(400).json({
        error: 'NOT_EXECUTABLE',
        message: `EventType '${comp_name}' is not executable (template: ${template_name})`
      });
    }

    logger.debug(`${codeName} Found ServerQuery: ${comp_name}`);

    // Replace parameters in SQL (for stored procedure: pageID parameter)
    let finalSQL = querySQL;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        finalSQL = finalSQL.replace(new RegExp(`\\?|:${key}`, 'g'), value);
      });
    }

    logger.debug(`${codeName} Executing SQL: ${finalSQL}`);

    // Execute the query using GET method
    const result = await executeQuery(finalSQL, 'GET');

    logger.info(`${codeName} EventType executed successfully: ${comp_name} (xrefId: ${xrefId})`);

    res.json({
      eventType: comp_name,
      template: template_name,
      xrefId: xrefId,
      data: result
    });

  } catch (error) {
    logger.error(`${codeName} EventType execution failed for xrefId ${xrefId}:`, error);

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || 'EVENTTYPE_EXECUTION_FAILED',
      message: error.message,
      xrefId: xrefId
    });
  }
};

export default execEventType;
