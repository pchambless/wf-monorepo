import React from 'react';

/**
 * Vanilla React text input field - NO MUI!
 * Unified with PageRenderer field system
 */
const TextField = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  placeholder = '',
  fullWidth = true,
  maxLength,
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`field-wrapper text-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={`field-input ${error ? 'error' : ''}`}
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

export default TextField;