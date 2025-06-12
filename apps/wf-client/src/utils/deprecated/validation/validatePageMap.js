/**
 * Validates that a pageMap has the required structure
 */
export function validatePageMap(pageMap) {
  const errors = [];
  
  // Check basic structure
  if (!pageMap) errors.push('PageMap is missing');
  else if (!pageMap.id) errors.push('PageMap is missing ID');
  else if (!pageMap.pageConfig) errors.push('PageMap is missing pageConfig');
  else if (!Array.isArray(pageMap.columnMap)) errors.push('PageMap is missing columnMap array');
  
  // If we have columns, check each one
  if (pageMap?.columnMap?.length > 0) {
    pageMap.columnMap.forEach((column, index) => {
      if (!column.field) {
        errors.push(`Column ${index} is missing 'field' property`);
      }
      
      // Only check displayType for non-system fields
      if (!column.system && !column.displayType) {
        errors.push(`Column ${column.field || index} is missing 'displayType' property`);
      }
    });
  }
  
  return { 
    isValid: errors.length === 0,
    errors
  };
}
