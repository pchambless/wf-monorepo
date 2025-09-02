import React from 'react';

/**
 * Vanilla React numeric input field - NO MUI!
 * Unified with PageRenderer field system
 */
const NumberField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  min,
  max,
  step = 1,
  fullWidth = true,
  placeholder = '',
  ...props
}) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty field
    if (rawValue === '') {
      onChange(null);
      return;
    }
    
    // Convert to number and validate
    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className={`field-wrapper number-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <input
        type="number"
        value={value === null || value === undefined ? '' : value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`field-input field-number ${error ? 'error' : ''}`}
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

export default NumberField;