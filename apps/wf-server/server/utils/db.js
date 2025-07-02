import mysql from 'mysql2/promise';
import { host, user, password, database, port, charset } from './dbConfig.js';
const codeName = `[db.js] `;

// Create a connection pool using the extracted properties
const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  charset
});

export default {
  getConnection: async () => {
    return await pool.getConnection();
  },
  query: async (sql) => { // Removed params argument
    const [results, ] = await pool.query(sql); // Removed params from query call
    return results;
  },
  beginTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  },
  commit: async (connection) => {
    await connection.commit();
    connection.release();
  },
  rollback: async (connection) => {
    await connection.rollback();
    connection.release();
  }
};
