import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const codeName = '[runMigration.js]';

const runMigration = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    const migrationPath = '/home/paul/Projects/migration';
    const scriptPath = path.join(migrationPath, 'migration/run.sh');

    logger.info(`${codeName} Starting migration script (SSH tunnels should already be running)`);

    try {
        // Use spawn without cwd option (Node.js bug - cwd breaks spawn on some systems)
        // Instead, cd to the directory within the bash command
        const migrationProcess = spawn('/usr/bin/bash', ['-c', `cd ${migrationPath} && bash ${scriptPath}`], {
            env: { ...process.env, PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' }
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
            global.migrationRunning = false;
        });

        // Send response immediately after starting process
        res.json({
            success: true,
            message: 'Migration started - poll /api/util/migration-status for progress'
        });

    } catch (error) {
        logger.error(`${codeName} Failed to start migration:`, error);
        res.status(500).json({
            success: false,
            error: 'MIGRATION_START_FAILED',
            message: error.message
        });
    }
};

export default runMigration;
