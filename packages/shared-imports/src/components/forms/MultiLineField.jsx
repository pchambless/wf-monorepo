import React from 'react';

/**
 * Vanilla React multi-line text field - NO MUI!
 * Unified with PageRenderer field system
 */
const MultiLineField = ({
  value,
  onChange,
  label,
  required = false,
  rows = 3,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  placeholder = '',
  ...props
}) => {
  return (
    <div className={`field-wrapper multiline-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`field-input field-textarea ${error ? 'error' : ''}`}
        style={{ resize: 'vertical', lineHeight: 1.5 }}
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

export default MultiLineField;