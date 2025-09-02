import React from 'react';

/**
 * Vanilla React decimal field - NO MUI!
 * Unified with PageRenderer field system
 */
const DecimalField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  precision = 2,
  min,
  max,
  prefix = '',
  suffix = '',
  fullWidth = true,
  placeholder = '',
  ...props
}) => {
  // Handle change with proper numeric parsing
  const handleChange = (e) => {
    const rawValue = e.target.value;
    
    // Allow empty field
    if (rawValue === '') {
      onChange(null);
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  // Format the display value
  const displayValue = value !== null && value !== undefined 
    ? Number(value).toFixed(precision) 
    : '';

  return (
    <div className={`field-wrapper decimal-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <div className="input-with-addons">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={`0.${'0'.repeat(precision-1)}1`}
          className={`field-input field-decimal ${error ? 'error' : ''}`}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {helperText && (
        <small className={`field-hint ${error ? 'error' : ''}`}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default DecimalField;