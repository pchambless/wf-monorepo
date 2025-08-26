import { createRequestBody } from './queryResolver.js';
import { executeQuery } from './dbUtils.js';
import logger from './logger.js';
import { getEventType } from '../events/index.js';

const codeName = `[executeEventType.js]`;

/**
 * Execute an event type with parameter substitution
 * Shared utility for both execEventType controller and dmlProcessor
 * 
 * @param {string} eventType - The event type to execute
 * @param {Object} params - Parameters for query substitution
 * @returns {Promise<Object>} Query result data
 * @throws {Error} Structured error with status code and details
 */
export const executeEventType = async (eventType, params) => {
    // Log sanitized parameters
    const sanitizedParams = logger.sanitizeLogData(params);
    logger.debug(`${codeName} Executing event: ${eventType}`, { params: sanitizedParams });

    try {
        // Find the eventType using the shared-events function
        const eventRoute = getEventType(eventType);
        if (!eventRoute) {
            const error = new Error(`Event type '${eventType}' not found`);
            error.status = 400;
            error.code = 'INVALID_EVENT_TYPE';
            throw error;
        }

        const { qrySQL, method, configKey, configOptions } = eventRoute;
        logger.debug(`${codeName} Found event route with method: ${method}`);

        let result;
        
        // Handle SQL queries only - CONFIG is client-side
        const qryMod = createRequestBody(qrySQL, params);
        result = await executeQuery(qryMod, method);
        
        logger.info(`${codeName} Event executed successfully: ${eventType}`);
        return result;

    } catch (error) {
        // If error doesn't have status, it's likely a database or system error
        if (!error.status) {
            error.status = 500;
            error.code = error.code || 'EVENT_EXECUTION_FAILED';
        }
        
        logger.error(`${codeName} Event execution failed for ${eventType}:`, error);
        throw error;
    }
};