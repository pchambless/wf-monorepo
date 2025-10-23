import { spawn } from 'child_process';
import logger from '../utils/logger.js';

const codeName = '[openTerminal.js]';

const openTerminal = async (req, res) => {
    logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

    const { directory, command } = req.body;

    if (!directory) {
        return res.status(400).json({
            success: false,
            error: 'MISSING_DIRECTORY',
            message: 'Directory path is required'
        });
    }

    logger.info(`${codeName} Opening terminal in ${directory}`);

    try {
        const terminalCommand = command
            ? `x-terminal-emulator -e "cd '${directory}' && ${command}; exec bash"`
            : `x-terminal-emulator -e "cd '${directory}'; exec bash"`;

        logger.info(`${codeName} Executing: ${terminalCommand}`);

        const termProc = spawn(terminalCommand, [], {
            shell: true,
            detached: true,
            stdio: 'ignore'
        });

        termProc.unref();

        res.json({
            success: true,
            message: 'Terminal opened successfully'
        });

    } catch (error) {
        logger.error(`${codeName} Failed to open terminal:`, error);
        res.status(500).json({
            success: false,
            error: 'TERMINAL_OPEN_FAILED',
            message: error.message
        });
    }
};

export default openTerminal;
