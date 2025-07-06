import React from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';

/**
 * Decimal/currency input field widget
 */
const DecimalField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  precision = 2,
  min,
  max,
  prefix = '',
  suffix = '',
  fullWidth = true,
  ...props
}) => {
  // Handle change with proper numeric parsing
  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty field
    if (rawValue === '') {
      onChange(null);
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  // Format the display value
  const displayValue = value !== null && value !== undefined 
    ? Number(value).toFixed(precision) 
    : '';

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        type="number"
        value={displayValue}
        onChange={handleChange}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        variant="outlined"
        fullWidth={fullWidth}
        size="small"
        InputProps={{
          startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
          endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null,
        }}
        inputProps={{
          min: min,
          max: max,
          step: `0.${'0'.repeat(precision-1)}1` // Creates step like 0.01, 0.001, etc.
        }}
        {...props}
      />
    </Box>
  );
};

export default DecimalField;