/**
 * Multi-Line Text Field Renderer Implementation
 */
import React from 'react';
import { TextField } from '@mui/material';
import { observer } from 'mobx-react-lite';

class MultiLineRenderer {
  /**
   * Render a multi-line text field
   */
  render = observer(({ field, store, disabled }) => {
    return (
      <TextField
        fullWidth
        id={`field-${field.field}`}
        name={field.field}
        label={field.label}
        value={store.value || ''}
        onChange={(e) => store.setValue(e.target.value)}
        onBlur={() => store.setTouched()}
        disabled={disabled || !field.editable}
        required={field.required}
        error={!!store.error}
        helperText={store.error}
        margin="normal"
        variant="outlined"
        size="small"
        multiline
        minRows={3}
        maxRows={8}
        sx={{
          '& .MuiInputBase-root': {
            height: 'auto',
            minHeight: '100px'
          }
        }}
      />
    );
  });
}

export default MultiLineRenderer;
