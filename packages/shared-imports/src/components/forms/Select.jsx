import React from 'react';
import { FormControl } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import accountStore from '../../stores/accountStore';

// Simplified with explicit props
const Select = observer(({ 
  placeholder, 
  onChange, 
  value, 
  options: directOptions = [], 
  listName = null,
  valueKey = 'id',
  labelKey = 'name',
  sx 
}) => {
  // Get options - either from store or direct props
  const options = listName ? (accountStore[listName] || []) : directOptions;
  
  // Find the currently selected option
  const selectedOption = options.find(
    option => option && String(option[valueKey]) === String(value)
  );

  // Handle selection change
  const handleChange = (event, newValue) => {
    if (!onChange) return;
    if (!newValue) {
      onChange('');
      return;
    }
    
    const selected = options.find(opt => opt[labelKey] === newValue);
    onChange(selected ? selected[valueKey] : '');
  };
  
  return (
    <FormControl fullWidth>
      <Autocomplete
        disablePortal
        options={options.map(opt => opt[labelKey])}
        value={selectedOption ? selectedOption[labelKey] : ''}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={placeholder}
            variant="outlined"
            sx={sx}
            error={options.length === 0}
            helperText={options.length === 0 ? `No options available` : ''}
          />
        )}
      />
    </FormControl>
  );
});

export default Select;
