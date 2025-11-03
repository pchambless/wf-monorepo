/**
 * SQL building utilities for bulk operations
 */

/**
 * Build bulk INSERT SQL statement
 * @param {string} table - Table name (schema.table)
 * @param {Array} records - Array of objects to insert
 * @returns {string} SQL statement
 */
export function buildBulkInsertSQL(table, records) {
  if (!records || records.length === 0) {
    throw new Error('No records to insert');
  }

  // Get column names from first record
  const columns = Object.keys(records[0]);
  const columnList = columns.join(', ');

  // Build VALUES clause
  const valueRows = records.map(record => {
    const values = columns.map(col => {
      const value = record[col];
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'number') {
        return value;
      }
      // Escape single quotes and wrap in quotes
      const escaped = String(value).replace(/'/g, "''");
      return `'${escaped}'`;
    });
    return `(${values.join(', ')})`;
  });

  return `INSERT INTO ${table} (${columnList}) VALUES ${valueRows.join(', ')}`;
}
