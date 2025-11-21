import logger from './logger.js';
import mysql from 'mysql2/promise';
const codeName = '[dbManager.js]';

function getConfig() {
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        charset: process.env.DB_CHARSET || 'utf8mb4'
    };
}

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.lastCheck = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds
        this.healthCheckInterval = 900000; // 15 minutes instead of 5
        this.lastHealthCheckStatus = null;
    }

    async initialize() {
        try {
            const config = {
                ...getConfig(),
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            };

            this.pool = mysql.createPool(config);

            // Add connection error handler
            this.pool.on('error', (err) => {
                logger.error(`${codeName} Pool error:`, err);
                this.isConnected = false;
                this.handleConnectionError(err);
            });

            // Start health check interval
            this.startHealthCheck();

            // Test initial connection
            await this.testConnection();
            
            return this.pool;
        } catch (error) {
            logger.error(`${codeName} Failed to initialize database:`, error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            this.isConnected = true;
            this.lastCheck = new Date();
            this.retryAttempts = 0;

            // Only log status changes to reduce noise
            const currentStatus = true;
            if (this.lastHealthCheckStatus !== currentStatus) {
                logger.info(`${codeName} Database connection test successful`);
                this.lastHealthCheckStatus = currentStatus;
            }

            connection.release();
            return true;
        } catch (error) {
            this.isConnected = false;
            this.lastHealthCheckStatus = false;
            logger.error(`${codeName} Database connection test failed:`, error);
            throw error;
        }
    }

    startHealthCheck() {
        // Track status changes and logging frequency
        let lastStatus = this.isConnected;
        let lastLogTime = null;
        
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
        }

        this._healthCheckInterval = setInterval(async () => {
            try {
                await this.testConnection();
                
                const now = new Date();
                const statusChanged = lastStatus !== this.isConnected;
                const logTimeThreshold = lastLogTime ? 
                    (now - lastLogTime) > (3600000) : // Log once per hour at most
                    true;
                
                // Only log on status change or once per hour
                if (statusChanged || logTimeThreshold) {
                    logger.debug(`${codeName} Database connected: health check passed`);
                    lastLogTime = now;
                }
                
                lastStatus = this.isConnected;
            } catch (error) {
                // Always log failures, but only full details on status change
                if (lastStatus !== false) {
                    logger.warn(`${codeName} Health check failed:`, error);
                } else {
                    logger.warn(`${codeName} Health check still failing`);
                }
                lastStatus = false;
            }
        }, this.healthCheckInterval);

        // Ensure cleanup on process exit
        process.on('SIGTERM', () => {
            if (this._healthCheckInterval) {
                clearInterval(this._healthCheckInterval);
            }
        });
    }

    async handleConnectionError(error) {
        if (this.retryAttempts < this.maxRetries) {
            this.retryAttempts++;
            logger.warn(`${codeName} Attempting to reconnect (${this.retryAttempts}/${this.maxRetries})`);
            
            setTimeout(async () => {
                try {
                    await this.initialize();
                } catch (error) {
                    logger.error(`${codeName} Reconnection attempt failed:`, error);
                }
            }, this.retryDelay);
        } else {
            logger.error(`${codeName} Max retry attempts reached. Manual intervention required.`);
        }
    }

    async executeWithRetry(operation, maxRetries = 2) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (this.isRetryableError(error) && attempt < maxRetries) {
                    logger.warn(`${codeName} Retrying operation (${attempt}/${maxRetries}):`, error);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                } else {
                    throw error;
                }
            }
        }
    }

    isRetryableError(error) {
        const retryableCodes = [
            'PROTOCOL_CONNECTION_LOST',
            'ER_CON_COUNT_ERROR',
            'ECONNREFUSED',
            'ER_LOCK_DEADLOCK'
        ];
        return retryableCodes.includes(error.code);
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            lastCheck: this.lastCheck,
            retryAttempts: this.retryAttempts,
            poolConfig: {
                connectionLimit: this.pool?.config?.connectionLimit,
                queueLimit: this.pool?.config?.queueLimit
            }
        };
    }

    async end() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
        }
        if (this.pool) {
            await this.pool.end();
            logger.info(`${codeName} Database connection pool closed`);
        }
    }
}

// Export singleton instance
const dbManager = new DatabaseManager();
export default dbManager;
