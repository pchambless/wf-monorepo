import logger from './logger.js';

const fileName = '[dbUtils.js]';

function getPool() {
    if (!global.pool) {
        throw new Error('Database pool not initialized. Server startup incomplete.');
    }
    return global.pool;
}

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
 * @param {Array} params - Optional parameters for parameterized queries
 * @returns {Promise<Object>} Query results
 */
async function executeQuery(query, method = 'GET', params = []) {
    let connection;
    const start = process.hrtime();

    try {
        const pool = getPool();
        connection = await pool.getConnection();

        // Log sanitized query
        logger.debug(`${fileName} Executing ${method} query: ${sanitizeQuery(query)}`);
        if (params.length > 0) {
            logger.debug(`${fileName} With ${params.length} parameters (sizes: ${params.map(p => typeof p === 'string' ? p.length : 'N/A').join(', ')} chars)`);
        }

        let results;
        if (['POST', 'PATCH', 'DELETE'].includes(method)) {
//            logger.debug(`${fileName} Handling ${method}-specific logic`);
            await connection.beginTransaction();
            results = await connection.execute(query, params);
            await connection.commit();
        } else if (method === 'GET') {
//            logger.debug(`${fileName} Handling GET-specific logic`);
            const [rows] = await connection.execute(query, params);

            // Handle stored procedure results (CALL returns [[data], metadata])
            if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) {
                results = rows[0]; // Extract first result set from stored procedure
                logger.info(`${fileName} Stored procedure executed, rows fetched: ${results.length}`);
            } else {
                results = rows;
                logger.info(`${fileName} Query executed, rows fetched: ${rows.length}`);
            }
        } else {
            throw new Error(`Unsupported method: ${method}`);
        }

        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        logger.logPerformance('database_query', duration, {
//            method,
            rowCount: Array.isArray(results) ? results.length : undefined,
//            success: true
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
//        logger.error(`${fileName} Stack trace: ${new Error().stack}`);
        if (['POST', 'PATCH', 'DELETE'].includes(method) && connection) {
            await connection.rollback();
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
//            logger.debug(`${fileName} Connection released`);
        }
    }
}

export { executeQuery };
