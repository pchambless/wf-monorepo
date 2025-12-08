import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';
import { getUserEmail } from '../utils/getUserEmail.js';

const codeName = '[copilotQuery.js]';

/**
 * Execute raw SQL queries for GitHub Copilot
 * POST /api/copilot/query
 *
 * Body:
 * {
 *   sql: "SELECT * FROM api_wf.page_registry WHERE id = ?",
 *   params: [11],
 *   maxRows: 100  // optional, defaults to 100
 * }
 *
 * Safety Features:
 * - Read-only in production (blocks UPDATE/DELETE/DROP/ALTER)
 * - Automatic row limits
 * - Parameterized queries
 * - Full audit logging
 */
const copilotQuery = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  const { sql, params = [], maxRows = 100 } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({
      error: 'INVALID_SQL',
      message: 'sql string is required'
    });
  }

  try {
    // Get user email for audit trail
    const userEmail = getUserEmail(req);
    logger.info(`${codeName} Query requested by ${userEmail}`);

    // Safety: prevent write operations in production
    if (process.env.NODE_ENV === 'production') {
      const upperSQL = sql.toUpperCase().trim();
      const writeOperations = ['UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'CREATE', 'INSERT'];
      
      for (const operation of writeOperations) {
        if (upperSQL.startsWith(operation) || upperSQL.includes(` ${operation} `)) {
          logger.warn(`${codeName} Blocked write operation in production: ${operation}`);
          return res.status(403).json({
            error: 'WRITE_OPERATION_BLOCKED',
            message: 'Write operations are not allowed in production. Use development environment.'
          });
        }
      }
    }

    // Add LIMIT clause if not present and it's a SELECT
    let safeSql = sql.trim();
    const upperSQL = safeSql.toUpperCase();
    
    if (upperSQL.startsWith('SELECT') && !upperSQL.includes('LIMIT')) {
      safeSql = `${safeSql} LIMIT ${maxRows}`;
      logger.debug(`${codeName} Added LIMIT ${maxRows} to query`);
    }

    logger.debug(`${codeName} Executing query with ${params.length} parameters`);

    const result = await executeQuery(safeSql, 'GET', params);

    logger.info(`${codeName} Query completed successfully`);

    res.json({
      success: true,
      data: result,
      rowCount: Array.isArray(result) ? result.length : (result.data ? result.data.length : 0),
      userEmail
    });

  } catch (error) {
    logger.error(`${codeName} Query failed:`, error);

    const status = error.status || 500;

    res.status(status).json({
      error: error.code || 'QUERY_FAILED',
      message: error.message,
      sql: sql.substring(0, 200) // Include first 200 chars for debugging
    });
  }
};

export default copilotQuery;
