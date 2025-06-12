/**
 * Select Field Renderer Implementation
 */
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';

class SelectFieldRenderer {
  /**
   * Render a select field
   */
  render = observer(({ field, store, disabled }) => {
    const labelId = `label-${field.field}`;
    
    // Handle empty options state
    if (store.loading) {
      return (
        <FormControl fullWidth margin="normal" variant="outlined" size="small">
          <InputLabel id={labelId}>{field.label}</InputLabel>
          <Select
            labelId={labelId}
            id={`field-${field.field}`}
            label={field.label}
            disabled
          >
            <MenuItem value="">
              <CircularProgress size={20} /> Loading...
            </MenuItem>
          </Select>
        </FormControl>
      );
    }
    
    return (
      <FormControl 
        fullWidth 
        margin="normal" 
        variant="outlined" 
        size="small"
        error={!!store.error}
        required={field.required}
        disabled={disabled || !field.editable}
      >
        <InputLabel id={labelId}>{field.label}</InputLabel>
        <Select
          labelId={labelId}
          id={`field-${field.field}`}
          value={store.value ?? ''}
          label={field.label}
          onChange={(e) => store.setValue(e.target.value)}
          onBlur={() => store.setTouched()}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {store.options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {store.error && <FormHelperText>{store.error}</FormHelperText>}
      </FormControl>
    );
  });
}

export default SelectFieldRenderer;
