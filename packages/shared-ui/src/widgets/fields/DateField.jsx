import React from 'react';
import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';

/**
 * Date picker field widget
 */
const DateField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  minDate,
  maxDate,
  fullWidth = true,
  ...props
}) => {
  // Convert string dates to Date objects if needed
  const dateValue = value ? (value instanceof Date ? value : new Date(value)) : null;
  
  // Handle date change
  const handleChange = (newDate) => {
    onChange(newDate);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={dateValue}
          onChange={handleChange}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              error={error}
              helperText={helperText || params.helperText}
              variant="outlined"
              fullWidth={fullWidth}
              size="small"
              {...props}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateField;