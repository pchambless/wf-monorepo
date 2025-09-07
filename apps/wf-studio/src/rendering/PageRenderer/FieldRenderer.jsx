/**
 * FieldRenderer - Handles individual field rendering
 * 
 * Renders different field types with proper validation and styling
 * Supports all common form field types and custom attributes
 */

import React from 'react';

const FieldRenderer = ({ field, componentKey }) => {
  const fieldId = `${componentKey}-${field.name}`;

  /**
   * Render field input based on type
   */
  const renderFieldInput = () => {
    const commonProps = {
      id: fieldId,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      className: `field-input field-${field.type}`
    };

    switch (field.type) {
      case 'text':
        return <input type="text" {...commonProps} />;
      
      case 'textarea':
        return (
          <textarea 
            {...commonProps} 
            rows={field.rows || 3}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {renderSelectOptions()}
          </select>
        );
      
      case 'checkbox':
        return (
          <input 
            type="checkbox" 
            {...commonProps}
            className="field-checkbox"
          />
        );
      
      case 'email':
        return <input type="email" {...commonProps} />;
      
      case 'password':
        return <input type="password" {...commonProps} />;
      
      case 'number':
        return (
          <input 
            type="number" 
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      
      case 'date':
        return <input type="date" {...commonProps} />;
      
      case 'time':
        return <input type="time" {...commonProps} />;
      
      case 'url':
        return <input type="url" {...commonProps} />;
      
      case 'tel':
        return <input type="tel" {...commonProps} />;
      
      case 'hidden':
        return <input type="hidden" {...commonProps} />;
      
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  /**
   * Render select options
   */
  const renderSelectOptions = () => {
    if (!field.options) return null;

    // Handle different option formats
    if (typeof field.options === 'string') {
      // String reference to options function - would need to be resolved
      return <option value="">Loading options...</option>;
    }

    if (Array.isArray(field.options)) {
      return field.options.map((option, index) => {
        // Handle different option formats
        if (typeof option === 'string') {
          return <option key={index} value={option}>{option}</option>;
        } else if (option.value && option.label) {
          return <option key={index} value={option.value}>{option.label}</option>;
        }
        return null;
      });
    }

    return null;
  };

  /**
   * Get field wrapper styles based on percentage and other attributes
   */
  const getFieldWrapperStyle = () => {
    const style = {};

    // Apply percentage width
    if (field.percentage) {
      style.flexBasis = field.percentage;
      style.minWidth = 0; // Allows flex shrinking
    }

    // Apply custom styling
    if (field.style) {
      Object.assign(style, field.style);
    }

    return style;
  };

  /**
   * Render field validation message
   */
  const renderValidation = () => {
    if (!field.validation) return null;

    return (
      <div className="field-validation">
        {field.validation.required && !field.value && (
          <span className="validation-error">Required field</span>
        )}
        {field.validation.pattern && field.value && !new RegExp(field.validation.pattern).test(field.value) && (
          <span className="validation-error">{field.validation.message || 'Invalid format'}</span>
        )}
      </div>
    );
  };

  /**
   * Render field label with required indicator
   */
  const renderLabel = () => (
    <label htmlFor={fieldId} className="field-label">
      {field.label || field.name}
      {field.required && <span className="required-indicator">*</span>}
    </label>
  );

  /**
   * Render field hint/description
   */
  const renderHint = () => {
    if (!field.hint) return null;
    return <small className="field-hint">{field.hint}</small>;
  };

  /**
   * Render field debug info for Studio
   */
  const renderDebugInfo = () => {
    const debugAttrs = [];
    
    if (field.row) debugAttrs.push(`row: ${field.row}`);
    if (field.percentage) debugAttrs.push(`width: ${field.percentage}`);
    if (field.breakAfter) debugAttrs.push('breakAfter: true');
    if (field.auto) debugAttrs.push('auto-generated');
    
    if (debugAttrs.length === 0) return null;
    
    return (
      <div className="field-debug">
        <small className="debug-attrs">{debugAttrs.join(', ')}</small>
      </div>
    );
  };

  // Don't render hidden fields in Studio preview
  if (field.hidden && field.type !== 'hidden') {
    return (
      <div className="field-hidden" style={getFieldWrapperStyle()}>
        <div className="hidden-indicator">
          Hidden field: {field.name}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`field-wrapper field-${field.type} ${field.required ? 'required' : ''}`}
      style={getFieldWrapperStyle()}
      data-field-name={field.name}
    >
      {field.type !== 'hidden' && renderLabel()}
      
      <div className="field-input-wrapper">
        {renderFieldInput()}
      </div>
      
      {renderHint()}
      {renderValidation()}
      {renderDebugInfo()}
    </div>
  );
};

export default FieldRenderer;