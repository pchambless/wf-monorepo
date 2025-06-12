/**
 * Helper to check if all columns have required properties
 * Can be called in development to validate pageMap structure
 */
export function checkPageMapColumns(pageMap) {
  if (process.env.NODE_ENV !== 'development') return;
  
  if (!pageMap?.columnMap) {
    console.warn('❌ PageMap is missing columnMap array');
    return;
  }
  
  // Check for table name
  if (!pageMap?.pageConfig?.table) {
    console.warn('❌ PageMap is missing pageConfig.table (database table name)');
  }
  
  // Check for missing displayType
  const missingDisplayType = pageMap.columnMap.filter(col => !col.displayType);
  
  if (missingDisplayType.length > 0) {
    console.warn(
      `❌ PageMap has ${missingDisplayType.length} columns missing displayType:`, 
      missingDisplayType.map(col => col.field)
    );
  }
  
  // Check for missing dbColumn
  const missingDbColumn = pageMap.columnMap.filter(col => !col.dbColumn && !col.dbIgnore);
  
  if (missingDbColumn.length > 0) {
    console.warn(
      `❌ PageMap has ${missingDbColumn.length} columns missing dbColumn:`, 
      missingDbColumn.map(col => col.field)
    );
  }
  
  // Check for primary key
  const primaryKeys = pageMap.columnMap.filter(col => col.primaryKey);
  if (primaryKeys.length === 0) {
    console.warn('❌ PageMap has no primary key column defined (needed for DML)');
  }
  
  return {
    valid: missingDisplayType.length === 0 && missingDbColumn.length === 0 && primaryKeys.length > 0,
    missingDisplayType: missingDisplayType.map(col => col.field),
    missingDbColumn: missingDbColumn.map(col => col.field),
    hasPrimaryKey: primaryKeys.length > 0
  };
}
