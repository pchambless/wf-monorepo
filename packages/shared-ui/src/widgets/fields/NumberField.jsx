import React from 'react';
import { TextField, Box } from '@mui/material';

/**
 * Numeric input field widget
 */
const NumberField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  min,
  max,
  step = 1,
  fullWidth = true,
  ...props
}) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty field
    if (rawValue === '') {
      onChange(null);
      return;
    }
    
    // Convert to number and validate
    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        type="number"
        value={value === null || value === undefined ? '' : value}
        onChange={handleChange}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        variant="outlined"
        fullWidth={fullWidth}
        size="small"
        inputProps={{
          min: min,
          max: max,
          step: step
        }}
        {...props}
      />
    </Box>
  );
};

export default NumberField;