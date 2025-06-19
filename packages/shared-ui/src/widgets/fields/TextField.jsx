import React from 'react';
import { TextField as MuiTextField, Box } from '@mui/material';

/**
 * Text input field widget
 */
const TextField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  placeholder = '',
  fullWidth = true,
  maxLength,
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <MuiTextField
        value={value || ''}
        onChange={handleChange}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        placeholder={placeholder}
        variant="outlined"
        fullWidth={fullWidth}
        size="small"
        inputProps={{
          maxLength: maxLength
        }}
        {...props}
      />
    </Box>
  );
};

export default TextField;