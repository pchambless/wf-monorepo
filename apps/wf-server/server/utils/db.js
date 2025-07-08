import dbConnect from '@whatsfresh/db-connect';
const codeName = `[db.js] `;

// Create a connection pool using the db-connect package
const { createPool } = dbConnect;
const pool = createPool();

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
