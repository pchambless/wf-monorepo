import React from 'react';
import { TextField, Box } from '@mui/material';

/**
 * Multi-line text field with auto-expansion
 */
const MultiLineField = ({
  value,
  onChange,
  label,
  required = false,
  minRows = 3,
  maxRows = 8,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  ...props
}) => {
  return (
    <Box 
      sx={{ 
        width: '100%',
        my: 2, // Extra margin to separate from other fields
      }}
    >
      <TextField
        multiline
        minRows={minRows}
        maxRows={maxRows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        variant="outlined"
        fullWidth={fullWidth}
        sx={{
          '& .MuiInputBase-input': {
            lineHeight: 1.5
          }
        }}
        {...props}
      />
    </Box>
  );
};

export default MultiLineField;