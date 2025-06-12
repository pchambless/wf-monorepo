require('module-alias/register');
const logger = require('./logger');
const { createPool } = require('@whatsfresh/db-connect');
const fileName = '[dbUtils.js]';

// Initialize the connection pool using db-connect package
const pool = createPool({
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Sanitizes SQL queries for logging
 * @param {string} query SQL query to sanitize 
 * @returns {string} Sanitized query
 */
function sanitizeQuery(query) {
  // When logging SQL, wrap it in an object with a descriptive key
  // This allows logger.sanitizeLogData to process it
  const wrappedQuery = {
    sqlWithPossiblePassword: query
  };
  
  // Use the existing sanitize function
  const sanitized = logger.sanitizeLogData(wrappedQuery);
  
  // Return the sanitized SQL
  return sanitized.sqlWithPossiblePassword;
}

/**
 * Executes a database query with proper error handling and logging
 * @param {string} query - SQL query to execute
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Promise<Object>} Query results
 */
async function executeQuery(query, method = 'GET') {
    let connection;
    const start = process.hrtime();
    
    try {
        connection = await pool.getConnection();
        
        // Log sanitized query
        logger.debug(`${fileName} Executing ${method} query: ${sanitizeQuery(query)}`);

        let results;
        if (['POST', 'PATCH', 'DELETE'].includes(method)) {
            logger.debug(`${fileName} Handling ${method}-specific logic`);
            await connection.beginTransaction();
            results = await connection.execute(query);
            await connection.commit();
        } else if (method === 'GET') {
            logger.debug(`${fileName} Handling GET-specific logic`);
            const [rows] = await connection.execute(query);
            logger.info(`${fileName} Query executed, rows fetched: ${rows.length}`);
            results = rows;
        } else {
            throw new Error(`Unsupported method: ${method}`);
        }

        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        logger.logPerformance('database_query', duration, {
            method,
            rowCount: Array.isArray(results) ? results.length : undefined,
            success: true
        });

        return results;
    } catch (error) {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        logger.logPerformance('database_query', duration, {
            method,
            success: false,
            errorType: error.name,
            errorCode: error.code
        });

        logger.error(`${fileName} Error executing query:`, error);
        // Use sanitized query in error logs
        logger.error(`${fileName} Query: ${sanitizeQuery(query)}`);
        logger.error(`${fileName} Stack trace:`, new Error().stack);
        if (['POST', 'PATCH', 'DELETE'].includes(method) && connection) {
            await connection.rollback();
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
            logger.debug(`${fileName} Connection released`);
        }
    }
}

module.exports = { executeQuery };
