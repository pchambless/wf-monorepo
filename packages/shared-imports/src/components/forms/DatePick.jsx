import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import createLogger from '../../utils/logger';
import { useForm } from '../../c-crud/hooks/useForm'; // Use existing hook

const log = createLogger('DatePick');

// Use observer pattern for reactivity
const DatePick = observer(({ 
  placeholder, 
  onChange, 
  value: propValue,
  fieldName, // Use fieldName instead of varName to be consistent with CRUD system
  required, 
  sx 
}) => {
  // Use the form context from your existing system
  const form = useForm();
  
  // Get value from form store or fallback to prop
  const formValue = form ? form.getFieldValue(fieldName) : null;
  const effectiveValue = formValue !== undefined ? formValue : propValue;
  
  // Local state for the component
  const [selectedDate, setSelectedDate] = useState(
    effectiveValue ? new Date(effectiveValue) : null
  );
  
  const [loading] = useState(false);
  const [error] = useState(null);

  // Keep local state in sync with form value changes
  useEffect(() => {
    if (effectiveValue) {
      setSelectedDate(new Date(effectiveValue));
    } else {
      setSelectedDate(null);
    }
  }, [effectiveValue]);

  const handleChange = (date) => {
    setSelectedDate(date);
    
    // Simpler log with just essential information
    log.debug(`DatePick: ${fieldName || 'unnamed field'} → ${date ? date.toLocaleDateString() : 'null'}`);
    
    // Update form store if available
    if (form && fieldName) {
      form.setFieldValue(fieldName, date);
    }
    
    // Also call direct onChange prop if provided
    if (onChange) {
      onChange(date);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={placeholder}
        value={selectedDate}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            error={!!error}
            sx={sx}
          />
        )}
      />
    </LocalizationProvider>
  );
});

export default DatePick;
