import React, { forwardRef } from 'react';
import Form from '@crud/Form';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('FormSection');

/**
 * FormSection component - Handles the form display using the new config structure
 * 
 * @param {Object} props - Component props
 * @param {Object} props.config - Form configuration object
 */
const FormSection = forwardRef(({ config }, ref) => {
  // Config is now directly the formConfig section
  if (!config) {
    log.warn('No form configuration provided');
    return null;
  }
  
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
      config={config}
      data={dataStore.selectedRow || {}}
      mode={dataStore.formMode}
      onSave={handleFormSave}
      onCancel={handleFormCancel}
    />
  );
});

// Add display name for debugging
FormSection.displayName = 'FormSection';

export default FormSection;
