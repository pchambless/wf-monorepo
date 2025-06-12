import createLogger from '../logger';

const log = createLogger('DML.buildSql');

export const buildSqlStatement = (request) => {
  log.info('Build pseudo-SQL statement:');

  // Add defensive checks
  if (!request || typeof request !== 'object') {
    throw new Error('Invalid SQL request structure');
  }

  // Remove primaryKey from destructuring since it's not used
  const { method, table, params, columns = [] } = request;

  // Defensive check for required properties
  if (!method || !table) {
    throw new Error('Missing required SQL parameters (method or table)');
  }

  // Defensive check for columns
  if (!Array.isArray(columns)) {
    throw new Error('Columns must be an array');
  }

  // First, let's create a reusable function for formatting SQL values
  const formatSqlValue = (value, dataType) => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    if (['INT', 'FLOAT', 'DECIMAL', 'BIGINT'].includes(dataType)) {
      return value === '' ? 'NULL' : value;
    }
    
    // Default to treating as string with proper escaping
    return `'${(value || '').replace(/'/g, "''")}'`;
  };

  switch (method) {
    case 'INSERT':
      return `INSERT INTO ${table} 
        (${columns.map(f => f.dbColumn || f.field).join(', ')})
      VALUES 
        (${columns.map(f => `'${f.value}'`).join(', ')})`;

    case 'UPDATE':
      // Fix: params is an object, not an array
      // Convert non-primary key columns to SET statements
      const setClause = columns
        .filter(col => !col.primaryKey)
        .map(col => `${col.dbColumn || col.field} = ${formatSqlValue(col.value, col.dataType)}`)
        .join(', ');
      
      // Get the primary key for WHERE clause
      const pkColumn = columns.find(col => col.primaryKey);
      const whereClause = pkColumn 
        ? `${pkColumn.dbColumn || pkColumn.field} = ${formatSqlValue(pkColumn.value, pkColumn.dataType)}`
        : Object.entries(params).map(([key, value]) => `${key} = '${value}'`).join(' AND ');
      
      return `UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}`;

    case 'DELETE':
      // Fix: params is an object, not an array
      const deleteWhereClause = Object.entries(params)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      
      return `DELETE FROM ${table}
      WHERE ${deleteWhereClause}`;

    default:
      return 'Invalid method';
  }
};
