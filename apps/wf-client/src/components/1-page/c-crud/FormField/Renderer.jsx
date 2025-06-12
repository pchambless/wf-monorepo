import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import createLogger from '@utils/logger';
import { safeProp } from '@utils/mobxHelpers';

// Use logger consistently
const logger = createLogger('FormField.Renderer');

class FormFieldRenderer {
  constructor() {
    this.logger = createLogger('FormField.Renderer');
  }

  renderField(field, value, onChange, disabled = false) {
    // Use displayType directly from the column definition
    const displayType = field.displayType || 'text';
    
    switch (displayType) {
      case 'multiLine':
        return this.renderMultilineField(field, value, onChange, disabled);
      
      case 'select':
        return this.renderSelectField(field, value, onChange, disabled);
        
      case 'number':
        return this.renderNumberField(field, value, onChange, disabled);
      
      default:
        return this.renderTextField(field, value, onChange, disabled);
    }
  }
  
  renderMultilineField(field, value, onChange, disabled) {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        label={field.label}
        value={value || ''}
        onChange={onChange}
        required={field.required}
        disabled={disabled}
        sx={{
          '& .MuiInputBase-root': {
            height: 'auto',
            minHeight: '100px'
          }
        }}
      />
    );
  }
  
  renderTextField(field, value, onChange, disabled) {
    return (
      <TextField
        fullWidth
        label={field.label}
        value={value || ''}
        onChange={onChange}
        required={field.required}
        disabled={disabled}
      />
    );
  }
  
  renderNumberField(field, value, onChange, disabled) {
    return (
      <TextField
        fullWidth
        type="number"
        label={field.label}
        value={value || ''}
        onChange={onChange}
        required={field.required}
        disabled={disabled}
      />
    );
  }
  
  renderSelectField(field, value, onChange, disabled) {
    const { required, label, selList } = field;
    
    return (
      <FormControl fullWidth required={required} disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ''}
          onChange={onChange}
          label={label}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {selList && selList.map(item => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
}

const Renderer = ({ field, value, error, onChange, disabled }) => {
  // Get the appropriate renderer for this field type
  const FieldRenderer = getRendererForType(field.type);
  
  // Pass safe props to the specific renderer
  return (
    <FieldRenderer
      field={field} // Already safe from FormField
      value={value} // Already safe from FormField
      error={error} // Already safe from FormField
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default FormFieldRenderer;
