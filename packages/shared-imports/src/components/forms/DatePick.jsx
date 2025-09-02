import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { createLogger } from '@whatsfresh/shared-imports';
// import { useForm } from '../crud/hooks/useForm.js'; // Currently empty file

const log = createLogger('DatePick');

/**
 * Vanilla React DatePick with MobX integration - NO MUI!
 * Unified with PageRenderer field system but keeps form integration
 */
const DatePick = observer(({
  placeholder,
  onChange,
  value: propValue,
  fieldName,
  required,
  label,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true
}) => {
  // Use the form context from your existing system - fallback if hook not available
  // const form = useForm();
  const form = null; // Temporary fallback until useForm is implemented

  // Get value from form store or fallback to prop
  const formValue = form ? form.getFieldValue(fieldName) : null;
  const effectiveValue = formValue !== undefined ? formValue : propValue;

  // Local state for the component
  const [selectedDate, setSelectedDate] = useState(
    effectiveValue ? new Date(effectiveValue) : null
  );

  const [loading] = useState(false);

  // Keep local state in sync with form value changes
  useEffect(() => {
    if (effectiveValue) {
      setSelectedDate(new Date(effectiveValue));
    } else {
      setSelectedDate(null);
    }
  }, [effectiveValue]);

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const dateString = e.target.value;
    const date = dateString ? new Date(dateString) : null;
    
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
    return <div className="field-loading">Loading...</div>;
  }

  return (
    <div className={`field-wrapper datepick-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label || placeholder}
        {required && <span className="required-indicator">*</span>}
      </label>
      <input
        type="date"
        value={formatDateForInput(selectedDate)}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={`field-input field-datepick ${error ? 'error' : ''}`}
      />
      {helperText && (
        <small className={`field-hint ${error ? 'error' : ''}`}>
          {helperText}
        </small>
      )}
    </div>
  );
});

export default DatePick;
