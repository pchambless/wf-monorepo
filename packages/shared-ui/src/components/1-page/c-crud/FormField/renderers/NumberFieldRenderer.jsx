/**
 * Number Field Renderer Implementation
 */
import React from 'react';
import { TextField } from '@mui/material';
import { observer } from 'mobx-react-lite';

class NumberFieldRenderer {
  /**
   * Render a number field
   */
  render = observer(({ field, store, disabled }) => {
    return (
      <TextField
        fullWidth
        id={`field-${field.field}`}
        name={field.field}
        label={field.label}
        type="number"
        value={store.value ?? ''}
        onChange={(e) => {
          const value = e.target.value === '' ? null : Number(e.target.value);
          store.setValue(value);
        }}
        onBlur={() => store.setTouched()}
        disabled={disabled || !field.editable}
        required={field.required}
        error={!!store.error}
        helperText={store.error}
        margin="normal"
        variant="outlined"
        size="small"
        inputProps={{
          min: field.min,
          max: field.max,
          step: field.step || 1
        }}
      />
    );
  });
}

export default NumberFieldRenderer;
