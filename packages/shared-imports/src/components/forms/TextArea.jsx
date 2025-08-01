import React from "react";

/**
 * Simple, reliable TextArea using plain HTML textarea
 * No Material-UI complexity, just works!
 */
const TextArea = ({
  label,
  value,
  onChange,
  minRows = 5,
  maxRows = 15,
  required = false,
  disabled = false,
  error = false,
  helperText = "",
  placeholder = "",
  fullWidth = true,
  ...props
}) => {
  return (
    <div style={{ marginBottom: '16px', width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label 
          style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: required ? 'bold' : 'normal',
            color: error ? '#d32f2f' : '#333'
          }}
        >
          {label}{required ? ' *' : ''}
        </label>
      )}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        style={{
          width: '100%',
          minHeight: `${minRows * 24}px`,
          maxHeight: `${maxRows * 24}px`,
          padding: '12px',
          fontSize: '14px',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          border: `1px solid ${error ? '#d32f2f' : '#ccc'}`,
          borderRadius: '4px',
          resize: 'vertical',
          outline: 'none',
          backgroundColor: disabled ? '#f5f5f5' : '#fff',
          color: disabled ? '#999' : '#333',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#d32f2f' : '#1976d2';
          e.target.style.boxShadow = `0 0 0 2px ${error ? 'rgba(211, 47, 47, 0.2)' : 'rgba(25, 118, 210, 0.2)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#d32f2f' : '#ccc';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {helperText && (
        <div 
          style={{ 
            fontSize: '12px', 
            marginTop: '4px',
            color: error ? '#d32f2f' : '#666'
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextArea;
