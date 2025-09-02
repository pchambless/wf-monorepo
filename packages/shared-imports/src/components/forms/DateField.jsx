import React from 'react';

/**
 * Vanilla React date field - NO MUI!
 * Unified with PageRenderer field system
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
  placeholder = '',
  ...props
}) => {
  // Convert Date objects to string format for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    }
    return '';
  };

  // Handle date change - convert back to Date object
  const handleChange = (e) => {
    const dateString = e.target.value;
    if (dateString) {
      onChange(new Date(dateString));
    } else {
      onChange(null);
    }
  };

  // Format min/max dates for input
  const formatMinDate = minDate ? formatDateForInput(minDate) : undefined;
  const formatMaxDate = maxDate ? formatDateForInput(maxDate) : undefined;

  return (
    <div className={`field-wrapper date-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={formatMinDate}
        max={formatMaxDate}
        className={`field-input field-date ${error ? 'error' : ''}`}
        {...props}
      />
      {helperText && (
        <small className={`field-hint ${error ? 'error' : ''}`}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default DateField;