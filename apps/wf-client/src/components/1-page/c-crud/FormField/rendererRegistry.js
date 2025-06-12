import React from 'react';
import { TextField, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import createLogger from '@utils/logger';

const log = createLogger('RendererRegistry');

// Default text field renderer
const TextFieldRenderer = ({ field, value, onChange, error, disabled }) => (
  <TextField
    label={field?.label}
    name={field?.id}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    error={!!error}
    helperText={error}
    disabled={disabled}
    fullWidth
    size="small"
  />
);

// Default select field renderer
const SelectFieldRenderer = ({ field, value, onChange, error, disabled, options = [] }) => (
  <TextField
    select
    label={field?.label}
    name={field?.id}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    error={!!error}
    helperText={error}
    disabled={disabled}
    fullWidth
    size="small"
  >
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

// Checkbox renderer
const CheckboxRenderer = ({ field, value, onChange, disabled }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        name={field?.id}
      />
    }
    label={field?.label}
  />
);

// Add MultiLine renderer
const MultiLineRenderer = ({ field, value, onChange, error, disabled }) => (
  <TextField
    label={field?.label}
    name={field?.id}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    error={!!error}
    helperText={error}
    disabled={disabled}
    fullWidth
    multiline
    minRows={3}
    maxRows={10}
    size="small"
    sx={{ 
      width: '100%',
      // Add specific styling for multiline fields
      '& .MuiInputBase-root': {
        padding: '8px 12px',
        alignItems: 'flex-start'
      }
    }}
  />
);

// Registry of renderer components
const renderers = {
  text: TextFieldRenderer,
  string: TextFieldRenderer,
  select: SelectFieldRenderer,
  checkbox: CheckboxRenderer,
  boolean: CheckboxRenderer,
  multiline: MultiLineRenderer, // Add this
  multiLine: MultiLineRenderer,  // Add both cases for case-insensitive matching
  textarea: MultiLineRenderer,   // Alternative name
  // Add more as needed
};

// Default fallback renderer
const defaultRenderer = TextFieldRenderer;

// Create the registry object
const registry = {
  getRenderer(type) {
    if (!type) return defaultRenderer;
    
    const rendererType = type.toLowerCase();
    const renderer = renderers[rendererType];
    
    if (!renderer) {
      log.warn(`No renderer found for type: ${type}, falling back to default`);
      return defaultRenderer;
    }
    
    return renderer;
  },
  
  registerRenderer(type, component) {
    renderers[type.toLowerCase()] = component;
  }
};

export default registry;
