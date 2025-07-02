/**
 * Database connection module for WhatsFresh
 * Exports a unified interface for database operations
 */

const connection = require('./src/connection');
const query = require('./query');

module.exports = {
  // Export existing functionality
  ...connection,
  
  // Add new query method
  query
};