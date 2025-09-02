import React from "react";

/**
 * Vanilla React Select component - NO MUI!
 * Unified with PageRenderer field system
 */
const Select = ({
  value,
  onChange,
  label,
  options = [],
  required = false,
  disabled = false,
  error = false,
  helperText = "",
  fullWidth = true,
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={`field-wrapper select-field ${fullWidth ? 'full-width' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={`field-input field-select ${error ? 'error' : ''}`}
        {...props}
      >
        <option value="">Select...</option>
        {(options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon && `${option.icon} `}
            {option.label}
            {option.description && ` - ${option.description}`}
          </option>
        ))}
      </select>
      {helperText && (
        <small className={`field-hint ${error ? 'error' : ''}`}>
          {helperText}
        </small>
      )}
    </div>
  );
};

export default Select;
