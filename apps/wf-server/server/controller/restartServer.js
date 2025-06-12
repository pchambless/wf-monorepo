require('module-alias/register');
const { exec } = require('child_process');
const logger = require('@utils/logger');
const codeName = '[restartServer.js]';

/**
 * Configuration for the restart operation
 * @constant {Object}
 */
const CONFIG = {
  RESTART_TIMEOUT: 30000, // 30 seconds timeout
  SERVER_NAME: 'wf-server'
};

/**
 * Executes a command with a timeout
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<string>} Command output
 */
const execWithTimeout = (command, timeout) => {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr && stderr.length > 0) {
        reject(new Error(stderr));
        return;
      }
      resolve(stdout);
    });

    // Set timeout
    const timer = setTimeout(() => {
      process.kill();
      reject(new Error('Command execution timed out'));
    }, timeout);

    // Clear timeout on process exit
    process.on('exit', () => clearTimeout(timer));
  });
};

module.exports = {
  /**
   * Restarts the server using PM2
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */
  restartServer: (req, res) => {
    logger.info(`${codeName} Received request to restart the server.`);
    
    exec('pm2 restart wf-server', (error, stdout, stderr) => {
      if (error) {
        logger.error(`${codeName} Error restarting server:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to restart the server',
          error: error.message
        });
      }
      
      if (stderr) {
        logger.warn(`${codeName} Server restart warning:`, stderr);
      }
      
      logger.info(`${codeName} Server restart output:`, stdout);
      res.json({
        success: true,
        message: 'Server restarted successfully',
        output: stdout
      });
    });
  }
};
