/**
 * Select Field Renderer Implementation
 */
import React from 'react';
import { FormControl, FormHelperText, CircularProgress, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { observer } from 'mobx-react-lite';

class SelectFieldRenderer {
  /**
   * Render a select field with search capability
   */
  render = observer(({ field, store, disabled }) => {
    // Handle empty options state
    if (store.loading) {
      return (
        <FormControl fullWidth margin="normal" variant="outlined" size="small">
          <Autocomplete
            id={`field-${field.field}`}
            options={[]}
            loading={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      <CircularProgress color="inherit" size={20} />
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            disabled
          />
        </FormControl>
      );
    }
    
    // Convert options to Autocomplete format
    const autocompleteOptions = store.options.map(option => ({
      value: option.value,
      label: option.label,
    }));
    
    // Find the current selected option
    const selectedOption = autocompleteOptions.find(
      option => String(option.value) === String(store.value)
    ) || null;
    
    return (
      <FormControl 
        fullWidth 
        margin="normal" 
        variant="outlined" 
        size="small"
        error={!!store.error}
        required={field.required}
      >
        <Autocomplete
          id={`field-${field.field}`}
          options={autocompleteOptions}
          getOptionLabel={(option) => option.label}
          value={selectedOption}
          onChange={(_, newValue) => {
            store.setValue(newValue ? newValue.value : '');
          }}
          onBlur={() => store.setTouched()}
          disabled={disabled || !field.editable}
          renderInput={(params) => (
            <TextField
              {...params}
              label={field.label}
              variant="outlined"
              error={!!store.error}
              required={field.required}
            />
          )}
          isOptionEqualToValue={(option, value) => 
            option.value === value.value
          }
        />
        {store.error && <FormHelperText>{store.error}</FormHelperText>}
      </FormControl>
    );
  });
}

export default SelectFieldRenderer;
