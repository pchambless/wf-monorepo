/**
 * DML Data Builder
 * Transforms pageMap + formData into DML operations and SQL previews
 */
import { formatSQLValue, buildInsertSQL, buildUpdateSQL, buildDeleteSQL } from './sqlFormatter.js';

/**
 * Build DML data object using new pageMap structure
 */
export const buildDMLData = (pageMap, formData, method) => {
  const { systemConfig, dmlConfig, formConfig } = pageMap;
  
  // Get all form fields
  const fields = formConfig.groups.flatMap(group => group.fields);
  
  // Map form data to database columns using fieldMappings
  const mappedData = {};
  fields.forEach(field => {
    const dbColumn = dmlConfig.fieldMappings[field.field] || field.field;
    const value = formData[field.field];
    
    // Skip null/undefined values for INSERT, include all for UPDATE
    if (method === 'INSERT' && (value === null || value === undefined)) {
      return;
    }
    
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
 * Build SQL preview string
 */
export const buildSQLPreview = (pageMap, formData, method) => {
  const { systemConfig, dmlConfig, formConfig } = pageMap;
  const fields = formConfig.groups.flatMap(group => group.fields);
  
  const table = systemConfig.table;
  const primaryKey = systemConfig.primaryKey || 'id';
  
  switch (method) {
    case 'INSERT': 
      return buildInsertSQLPreview(fields, formData, dmlConfig, table);
    
    case 'UPDATE': 
      return buildUpdateSQLPreview(fields, formData, dmlConfig, table, primaryKey);
    
    case 'DELETE': 
      return buildDeleteSQLPreview(formData, table, primaryKey);
    
    default:
      return `-- Unknown method: ${method}`;
  }
};

/**
 * Build INSERT SQL preview
 */
const buildInsertSQLPreview = (fields, formData, dmlConfig, table) => {
  const columns = [];
  const values = [];
  
  fields.forEach(field => {
    const value = formData[field.field];
    if (value !== null && value !== undefined) {
      const dbColumn = dmlConfig.fieldMappings[field.field] || field.field;
      columns.push(dbColumn);
      values.push(formatSQLValue(value, field.type));
    }
  });
  
  return buildInsertSQL(table, columns, values);
};

/**
 * Build UPDATE SQL preview
 */
const buildUpdateSQLPreview = (fields, formData, dmlConfig, table, primaryKey) => {
  const setClauses = [];
  let whereClause = '';
  
  fields.forEach(field => {
    const dbColumn = dmlConfig.fieldMappings[field.field] || field.field;
    const value = formData[field.field];
    
    if (field.field === primaryKey) {
      whereClause = `${dbColumn} = ${formatSQLValue(value, field.type)}`;
    } else {
      setClauses.push(`${dbColumn} = ${formatSQLValue(value, field.type)}`);
    }
  });
  
  return buildUpdateSQL(table, setClauses, whereClause);
};

/**
 * Build DELETE SQL preview
 */
const buildDeleteSQLPreview = (formData, table, primaryKey) => {
  const pkValue = formData[primaryKey];
  const whereClause = `${primaryKey} = ${formatSQLValue(pkValue, 'id')}`;
  return buildDeleteSQL(table, whereClause);
};