/**
 * Boolean Field Renderer Implementation
 */
import React from 'react';
import { FormControlLabel, Checkbox, FormHelperText, FormControl } from '@mui/material';
import { observer } from 'mobx-react-lite';

class BooleanFieldRenderer {
  /**
   * Render a boolean field (checkbox)
   */
  render = observer(({ field, store, disabled }) => {
    return (
      <FormControl 
        fullWidth 
        margin="normal"
        error={!!store.error}
        required={field.required}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={!!store.value}
              onChange={(e) => store.setValue(e.target.checked)}
              onBlur={() => store.setTouched()}
              disabled={disabled || !field.editable}
              name={field.field}
              id={`field-${field.field}`}
            />
          }
          label={field.label}
        />
        {store.error && <FormHelperText>{store.error}</FormHelperText>}
      </FormControl>
    );
  });
}

export default BooleanFieldRenderer;
