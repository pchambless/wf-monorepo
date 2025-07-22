import { executeQuery } from '../dbUtils.js';
import { buildInsertSQL, buildUpdateSQL, buildDeleteSQL, buildSoftDeleteSQL } from './sqlBuilder.js';
import { executeEventType } from '../executeEventType.js';
import logger from '../logger.js';

const codeName = `[dmlProcessor.js]`;

/**
 * Build event parameters from DML data
 * Converts field names to :fieldName format for parameter substitution
 */
const buildEventParams = (data) => {
    const eventParams = {};
    Object.entries(data).forEach(([fieldName, value]) => {
        eventParams[`:${fieldName}`] = value;
    });
    return eventParams;
};

/**
 * Process DML request with validation, execution, and error handling
 */
export const processDML = async (requestBody) => {
    const { method, table, data, primaryKey, listEvent } = requestBody;

    // Log sanitized parameters
    const sanitizedData = logger.sanitizeLogData(data);
    logger.debug(`${codeName} Processing ${method} on ${table}`, { data: sanitizedData, primaryKey, listEvent });

    // Validate required fields
    if (!method || !table || !data) {
        const error = new Error('method, table, and data are required');
        error.status = 400;
        error.code = 'MISSING_REQUIRED_FIELDS';
        throw error;
    }

    // Validate method
    if (!['INSERT', 'UPDATE', 'DELETE'].includes(method)) {
        const error = new Error(`Method must be INSERT, UPDATE, or DELETE. Got: ${method}`);
        error.status = 400;
        error.code = 'INVALID_METHOD';
        throw error;
    }

    // Get userID for audit trail
    const userID = data.userID;
    if (!userID) {
        const error = new Error('userID is required for audit trail');
        error.status = 400;
        error.code = 'MISSING_USER_ID';
        throw error;
    }

    // Validate primaryKey for UPDATE/DELETE
    if ((method === 'UPDATE' || method === 'DELETE') && !primaryKey) {
        const error = new Error(`primaryKey is required for ${method} operations`);
        error.status = 400;
        error.code = 'MISSING_PRIMARY_KEY';
        throw error;
    }

    // Validate listEvent if provided
    if (listEvent && typeof listEvent !== 'string') {
        const error = new Error('listEvent must be a string when provided');
        error.status = 400;
        error.code = 'INVALID_LIST_EVENT';
        throw error;
    }

    let sql;
    let httpMethod;

    // Build SQL based on method
    switch (method) {
        case 'INSERT':
            sql = buildInsertSQL(table, data, userID);
            httpMethod = 'POST';
            break;

        case 'UPDATE':
            sql = buildUpdateSQL(table, data, 'id', userID); // All tables use 'id' as primary key field  
            httpMethod = 'PATCH';
            break;

        case 'DELETE':
            sql = buildDeleteSQL(table, data, 'id');
            httpMethod = 'DELETE';
            break;
    }

    logger.info(`${codeName} Executing ${method} SQL:`, logger.sanitizeLogData({ sql }));

    try {
        // Execute the SQL
        const result = await executeQuery(sql, httpMethod);

        logger.info(`${codeName} ${method} executed successfully on ${table}`);

        // Build DML result - no server-side refresh, handled by client
        return {
            success: true,
            method,
            table,
            result,
            message: `${method} operation completed successfully`
        };

    } catch (error) {
        // Handle referential integrity errors for DELETE operations
        if (method === 'DELETE' && (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 1451)) {
            logger.info(`${codeName} DELETE failed due to referential integrity, attempting soft delete`);

            try {
                // Fallback to soft delete
                const softDeleteSQL = buildSoftDeleteSQL(table, data, id, userID);
                logger.info(`${codeName} Executing soft delete SQL:`, logger.sanitizeLogData({ sql: softDeleteSQL }));

                const softResult = await executeQuery(softDeleteSQL, 'PATCH');

                logger.info(`${codeName} Soft delete executed successfully on ${table}`);

                // Build soft delete result - no server-side refresh, handled by client
                return {
                    success: true,
                    method: 'SOFT_DELETE',
                    table,
                    result: softResult,
                    message: 'Soft delete completed successfully (referential integrity preserved)'
                };
            } catch (softError) {
                logger.error(`${codeName} Soft delete also failed:`, softError);
                const error = new Error('Both hard delete and soft delete failed');
                error.status = 500;
                error.code = 'DELETE_FAILED';
                error.details = softError.message;
                throw error;
            }
        }

        // Re-throw other errors
        logger.error(`${codeName} ${method} operation failed:`, error);
        throw error;
    }
};