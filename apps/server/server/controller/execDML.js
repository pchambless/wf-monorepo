import { processDML } from '../utils/dml/dmlProcessor.js';
import logger from '../utils/logger.js';
import { getUserEmail } from '../utils/getUserEmail.js';

const codeName = `[execDML.js]`;

/**
 * Execute DML operation (INSERT, UPDATE, DELETE) with audit trail support
 */
const execDML = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    try {
        // Get user email using centralized function
        const userEmail = getUserEmail(req);

        // Remove userEmail from body to prevent it being treated as data field
        const { userEmail: _, ...requestBody } = req.body;

        const result = await processDML(requestBody, userEmail);

        logger.info(`${codeName} DML operation completed successfully`);
        res.json(result);

    } catch (error) {
        logger.error(`${codeName} DML operation failed:`, error);

        // Use error status if available, default to 500
        const status = error.status || 500;

        res.status(status).json({
            error: error.code || 'DML_EXECUTION_FAILED',
            message: error.message,
            ...(error.details && { details: error.details })
        });
    }
};

export default execDML;