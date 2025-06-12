const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from this package's .env
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

/**
 * Get database configuration
 */
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

/**
 * Create a database connection
 */
async function createConnection() {
  return await mysql.createConnection(getConfig());
}

/**
 * Create a connection pool
 */
function createPool(options = {}) {
  const config = {
    ...getConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ...options
  };
  
  return mysql.createPool(config);
}

module.exports = {
  getConfig,
  createConnection,
  createPool
};