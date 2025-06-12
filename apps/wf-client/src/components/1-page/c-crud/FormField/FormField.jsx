/**
 * Form Field Component - Uses MobX for state management
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import rendererRegistry from './rendererRegistry';
import { safeProp } from '@utils/mobxHelpers';

const FormField = observer(({ 
  column, 
  value, 
  error, 
  onChange, 
  disabled = false
}) => {
  // Convert field config to plain JS object
  const safeColumn = safeProp(column);
  const safeValue = safeProp(value);
  const safeError = safeProp(error);
  
  // Get field type safely
  const fieldType = safeColumn?.displayType || 'text';
  
  // Get appropriate renderer (safely - will always return a component)
  const Renderer = rendererRegistry.getRenderer(fieldType);
  
  // Render with all needed props
  return (
    <Renderer 
      id={safeColumn.field}
      label={safeColumn.label} 
      value={safeValue}
      error={safeError}
      onChange={onChange}
      disabled={disabled}
      // DON'T do this:
      // {...safeColumn}  // This spreads all properties, some might be observable
    
      // DO this instead:
      multiLine={safeColumn.multiLine}
      options={safeColumn.options}
    />
  );
});

export default FormField;
