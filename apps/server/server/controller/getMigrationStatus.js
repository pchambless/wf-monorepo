import logger from '../utils/logger.js';

const codeName = '[getMigrationStatus.js]';

const getMigrationStatus = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    const running = global.migrationRunning || false;
    const logs = global.migrationLogs || '';

    res.json({
        running,
        logs,
        complete: !running && logs.length > 0
    });
};

export default getMigrationStatus;
