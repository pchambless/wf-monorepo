import { processDML } from '../utils/dml/dmlProcessor.js';
import logger from '../utils/logger.js';

const codeName = `[execDML.js]`;

/**
 * Execute DML operation (INSERT, UPDATE, DELETE) with audit trail support
 */
const execDML = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    try {
        const result = await processDML(req.body);

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