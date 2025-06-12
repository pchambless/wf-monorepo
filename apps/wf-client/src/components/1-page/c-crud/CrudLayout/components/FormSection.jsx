import React, { forwardRef, useMemo } from 'react';
import Form from '@crud/Form';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('FormSection');

/**
 * FormSection component - Handles the form display and interactions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pageMap - Page configuration object
 */
const FormSection = forwardRef(({ pageMap }, ref) => {
  const { pageConfig } = pageMap || {};
  const formTitle = pageConfig?.title || 'Form';
  
  // Use useMemo to enhance columns with labels
  const enhancedPageMap = useMemo(() => {
    if (!pageMap || !Array.isArray(pageMap.columnMap)) {
      return pageMap;
    }
    
    log.debug('Original columns:', pageMap.columnMap.map(col => ({
      field: col.field,
      label: col.label,
      headerName: col.headerName
    })));
    
    // Create a new pageMap with enhanced columns
    return {
      ...pageMap,
      columnMap: pageMap.columnMap.map(col => ({
        ...col,
        // Ensure each column has a label property
        label: col.label || col.headerName || col.field
      }))
    };
  }, [pageMap]);
  
  // Log the enhanced columns
  log.debug('Enhanced columns:', enhancedPageMap?.columnMap?.map(col => ({
    field: col.field,
    label: col.label
  })));
  
  // Handle successful form submission
  const handleFormSave = () => {
    dataStore.refreshData();
  };
  
  // Handle form cancellation
  const handleFormCancel = () => {
    dataStore.selectRow(null);
    dataStore.setFormMode('SELECT');
  };

  return (
    <Form 
      ref={ref}
      pageMap={enhancedPageMap}
      data={dataStore.selectedRow || {}}
      mode={dataStore.formMode}
      formTitle={formTitle}
      onSave={handleFormSave}
      onCancel={handleFormCancel}
    />
  );
});

// Add display name for debugging
FormSection.displayName = 'FormSection';

export default FormSection;
