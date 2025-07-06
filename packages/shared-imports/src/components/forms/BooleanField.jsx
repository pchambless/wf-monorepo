import React from 'react';
import { Box, FormControlLabel, Checkbox, Switch, FormControl, FormHelperText } from '@mui/material';

/**
 * Boolean input field widget with checkbox or switch
 */
const BooleanField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  useSwitch = false, // Set to true for switch instead of checkbox
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  // Ensure value is a boolean
  const boolValue = Boolean(value);

  const Control = useSwitch ? Switch : Checkbox;

  return (
    <Box sx={{ width: '100%', pt: 1.5, pb: 0.5 }}>
      <FormControl error={error} required={required}>
        <FormControlLabel
          control={
            <Control
              checked={boolValue}
              onChange={handleChange}
              disabled={disabled}
              {...props}
            />
          }
          label={label}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default BooleanField;