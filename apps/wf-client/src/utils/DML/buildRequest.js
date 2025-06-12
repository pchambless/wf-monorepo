import createLogger from '../logger';

const log = createLogger('DML.BuildRequest');

/**
 * Builds a structured request object for DML operations
 * @param {Object} formData - Form data values
 * @param {Array} columns - Column configuration (enhanced with values)
 * @param {String} mode - SQL mode (INSERT/UPDATE/DELETE)
 * @returns {Object} Structured request body
 */
export const buildDmlRequest = (dmlMap) => {
  // Defensive check for dmlMap structure
  if (!dmlMap || typeof dmlMap !== 'object') {
    log.error('Invalid dmlMap structure', { received: typeof dmlMap });
    throw new Error('Invalid DML map structure');
  }
  
  const { dmlConfig = {}, columns = [] } = dmlMap;
  
  // Log what we're working with
  log.debug('Building DML request with config:', {
    method: dmlConfig.METHOD || 'UNKNOWN',
    tableName: dmlConfig.tableName || 'UNKNOWN',
    columnCount: columns.length
  });
  
  if (!dmlConfig.tableName) {
    log.error('Missing table name in DML configuration');
    throw new Error('Missing table name in DML configuration');
  }
  
  // Build params from columns that have values
  const params = columns.reduce((acc, col) => {
    if (col.value !== undefined) {
      acc[col.dbColumn || col.field] = col.value;
    }
    return acc;
  }, {});
  
  // Get primary key column
  const pkColumn = columns.find(col => col.primaryKey);
  
  // Return COMPLETE object with all required properties
  return {
    method: dmlConfig.METHOD,
    table: dmlConfig.tableName,
    entityType: dmlConfig.entityId,
    params: params,
    primaryKey: pkColumn ? pkColumn.field : dmlConfig.idField,
    columns: columns  // Add this! buildSqlStatement needs columns
  };
};
