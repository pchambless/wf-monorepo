/**
 * SQL Formatting Utilities
 * Pure functions for generating SQL statements
 */

/**
 * Format value for SQL display
 */
export const formatSQLValue = (value, fieldType) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (fieldType === 'number' || fieldType === 'integer') {
    return String(value);
  }
  
  // String values - escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`;
};

/**
 * Generate INSERT SQL statement
 */
export const buildInsertSQL = (table, columns, values) => {
  return `INSERT INTO ${table} 
  (${columns.join(', ')})
VALUES 
  (${values.join(', ')})`;
};

/**
 * Generate UPDATE SQL statement
 */
export const buildUpdateSQL = (table, setClauses, whereClause) => {
  return `UPDATE ${table}
SET ${setClauses.join(', ')}
WHERE ${whereClause}`;
};

/**
 * Generate DELETE SQL statement
 */
export const buildDeleteSQL = (table, whereClause) => {
  return `DELETE FROM ${table}
WHERE ${whereClause}`;
};