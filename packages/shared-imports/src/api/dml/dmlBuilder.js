/**
 * DML Data Builder
 * Transforms pageMap + formData into DML operations and SQL previews
 */
import { formatSQLValue, buildInsertSQL, buildUpdateSQL, buildDeleteSQL } from './sqlFormatter.js';

/**
 * Build DML data object using data-driven processing
 */
export const buildDMLData = (pageMap, formData, method) => {
  const { systemConfig, dmlConfig } = pageMap;
  
  // Data-driven: Process only fields that actually have values
  const mappedData = {};
  
  Object.entries(formData).forEach(([fieldName, value]) => {
    // Skip null/undefined values for INSERT, include all for UPDATE
    if (method === 'INSERT' && (value === null || value === undefined)) {
      return;
    }
    
    // Map form field to database column
    const dbColumn = dmlConfig.fieldMappings?.[fieldName] || fieldName;
    mappedData[dbColumn] = value;
  });
  
  // Add operation metadata
  return {
    method,
    table: systemConfig.table,
    data: mappedData,
    primaryKey: systemConfig.primaryKey || 'id'
  };
};

/**
 * Build SQL preview string using data-driven processing
 */
export const buildSQLPreview = (pageMap, formData, method) => {
  const { systemConfig, dmlConfig } = pageMap;
  const table = systemConfig.table;
  const primaryKey = systemConfig.primaryKey || 'id';
  
  switch (method) {
    case 'INSERT': 
      return buildInsertSQLPreview(formData, dmlConfig, table);
    
    case 'UPDATE': 
      return buildUpdateSQLPreview(formData, dmlConfig, table, primaryKey);
    
    case 'DELETE': 
      return buildDeleteSQLPreview(formData, table, primaryKey);
    
    default:
      return `-- Unknown method: ${method}`;
  }
};

/**
 * Build INSERT SQL preview using data-driven processing
 */
const buildInsertSQLPreview = (formData, dmlConfig, table) => {
  const columns = [];
  const values = [];
  
  Object.entries(formData).forEach(([fieldName, value]) => {
    if (value !== null && value !== undefined) {
      const dbColumn = dmlConfig.fieldMappings?.[fieldName] || fieldName;
      columns.push(dbColumn);
      values.push(formatSQLValue(value)); // Simplified - let formatSQLValue determine type
    }
  });
  
  return buildInsertSQL(table, columns, values);
};

/**
 * Build UPDATE SQL preview using data-driven processing
 */
const buildUpdateSQLPreview = (formData, dmlConfig, table, primaryKey) => {
  const setClauses = [];
  let whereClause = '';
  
  Object.entries(formData).forEach(([fieldName, value]) => {
    const dbColumn = dmlConfig.fieldMappings?.[fieldName] || fieldName;
    
    if (fieldName === primaryKey) {
      whereClause = `${dbColumn} = ${formatSQLValue(value)}`;
    } else {
      setClauses.push(`${dbColumn} = ${formatSQLValue(value)}`);
    }
  });
  
  return buildUpdateSQL(table, setClauses, whereClause);
};

/**
 * Build DELETE SQL preview using data-driven processing
 */
const buildDeleteSQLPreview = (formData, table, primaryKey) => {
  const pkValue = formData[primaryKey];
  const whereClause = `${primaryKey} = ${formatSQLValue(pkValue)}`;
  return buildDeleteSQL(table, whereClause);
};