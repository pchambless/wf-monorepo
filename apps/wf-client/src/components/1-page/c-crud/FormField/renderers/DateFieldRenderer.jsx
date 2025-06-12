/**
 * Date Field Renderer Implementation
 */
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { observer } from 'mobx-react-lite';

class DateFieldRenderer {
  /**
   * Render a date field
   */
  render = observer(({ field, store, disabled }) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={field.label}
          value={store.value || null}
          onChange={(newDate) => store.setValue(newDate)}
          disabled={disabled || !field.editable}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              variant: "outlined",
              size: "small",
              required: field.required,
              error: !!store.error,
              helperText: store.error,
              onBlur: () => store.setTouched()
            }
          }}
        />
      </LocalizationProvider>
    );
  });
}

export default DateFieldRenderer;
