/**
 * Simple database query utility for sample data generation
 */
const { createPool } = require('../../packages/db-connect');

// Create a dedicated pool for the data generator
const pool = createPool({
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

/**
 * Execute a simple SELECT query to extract data
 * @param {string} sql - SQL query to execute
 * @returns {Promise<Array>} - Query results
 */
async function query(sql) {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    
    // Execute the query (using the same pattern as your dbUtils)
    const [rows] = await connection.execute(sql);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error.message);
    console.error('SQL:', sql);
    throw error;
  } finally {
    // Always release the connection
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { query };