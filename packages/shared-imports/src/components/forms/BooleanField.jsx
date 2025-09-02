import React from 'react';

/**
 * Vanilla React boolean field - NO MUI!
 * Unified with PageRenderer field system
 */
const BooleanField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  useSwitch = false,
  fullWidth = true,
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  // Ensure value is a boolean
  const boolValue = Boolean(value);

  return (
    <div className={`field-wrapper boolean-field ${fullWidth ? 'full-width' : ''}`}>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={`${label}-checkbox`}
          checked={boolValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`field-checkbox ${error ? 'error' : ''} ${useSwitch ? 'switch-style' : ''}`}
          {...props}
        />
        <label htmlFor={`${label}-checkbox`} className="checkbox-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      </div>
      {helperText && (
        <small className={`field-hint ${error ? 'error' : ''}`}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default BooleanField;