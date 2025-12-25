// Minimal DB utility for loaders (stub, replace with your actual db connection)
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'wf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default {
  async query(sql) {
    const [rows] = await pool.query(sql);
    return rows;
  }
};
