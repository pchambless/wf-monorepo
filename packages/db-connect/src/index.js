// packages/db-connect/src/index.js
const connection = require('./connection');

module.exports = {
  getConfig: connection.getConfig,
  createConnection: connection.createConnection,
  createPool: connection.createPool
};