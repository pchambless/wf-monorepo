import { useMemo } from 'react';

/**
 * Hook to validate pageMap configuration
 * 
 * @param {Object} pageMap - The pageMap configuration object
 * @returns {Object} Validation results with isValid flag and errors array
 */
const usePageMapValidation = (pageMap) => {
  // Use useMemo to prevent re-validation on every render
  return useMemo(() => {
    const errors = [];
    
    // Check if pageMap exists
    if (!pageMap) {
      errors.push('PageMap is required');
      return { isValid: false, errors };
    }
    
    if (!pageMap.pageConfig) errors.push('Missing pageConfig in pageMap');
    if (!pageMap.columnMap) errors.push('Missing columnMap in pageMap');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [pageMap]); // Only re-run if pageMap reference changes
};

export default usePageMapValidation;
