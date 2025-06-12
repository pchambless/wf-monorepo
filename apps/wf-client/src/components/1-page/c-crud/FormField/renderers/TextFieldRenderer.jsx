/**
 * Text Field Renderer Implementation
 */
import React from 'react';
import { TextField } from '@mui/material';

const TextFieldRenderer = ({ field, value, error, onChange, disabled }) => {
  const { id, label } = field;

  return (
    <TextField
      id={id}
      label={label}
      value={value ?? ''}
      error={!!error}
      helperText={error || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      fullWidth
      size="small"
      margin="normal"
      variant="outlined"
    />
  );
};

export default TextFieldRenderer;
