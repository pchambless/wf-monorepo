import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import path from 'path';

const codeName = '[runMigration.js]';

const runMigration = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    const migrationPath = '/home/paul/projects/github/migration';
    const scriptPath = path.join(migrationPath, 'migration/run.sh');

    logger.info(`${codeName} Starting migration script (SSH tunnels should already be running)`);

    const migrationProcess = spawn(scriptPath, [], {
        cwd: migrationPath,
        shell: true,
        env: { ...process.env }
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';

    global.migrationLogs = '';
    global.migrationRunning = true;

    migrationProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdoutBuffer += output;
        global.migrationLogs += output;
        logger.info(`${codeName} [MIGRATION]: ${output.trim()}`);
    });

    migrationProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderrBuffer += output;
        global.migrationLogs += output;
        logger.error(`${codeName} [MIGRATION ERROR]: ${output.trim()}`);
    });

    res.json({
        success: true,
        message: 'Migration started - poll /api/util/migration-status for progress'
    });

    migrationProcess.on('close', (code) => {
        global.migrationRunning = false;
        if (code === 0) {
            logger.info(`${codeName} Migration completed successfully`);
        } else {
            logger.error(`${codeName} Migration failed with exit code ${code}`);
        }
    });

    migrationProcess.on('error', (error) => {
        logger.error(`${codeName} Failed to start migration:`, error);
        res.status(500).json({
            success: false,
            error: 'MIGRATION_START_FAILED',
            message: error.message
        });
    });
};

export default runMigration;
