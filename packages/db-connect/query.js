/**
 * Query utility for db-connect package
 * Provides a simplified interface for database queries
 */

const connection = require('./src/connection');

/**
 * Execute a database query
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Optional parameters for prepared statements
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
  let conn;
  try {
    // Get connection from pool
    const pool = connection.createPool();
    conn = await pool.getConnection();
    
    // Execute the query
    const [rows] = await conn.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error.message);
    console.error('SQL:', sql);
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

module.exports = query;