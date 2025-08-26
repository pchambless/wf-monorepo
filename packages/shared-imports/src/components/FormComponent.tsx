import React, { useState, useEffect } from 'react';

// Types based on your schema structure
interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  default: any;
  uiType: string;
  validationRules: string[];
  inputProps: Record<string, any>;
  foreignKey?: {
    type: string;
    mapping: string;
    widget: string;
    uiType: string;
  };
  primaryKey?: boolean;
}

interface FormSection {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
}

interface DisplayConfig {
  entityName: string;
  tableName: string;
  primaryKey: string;
  form: {
    sections: FormSection[];
  };
  actions: {
    create: { enabled: boolean; label: string };
    edit: { enabled: boolean; label: string };
    view: { enabled: boolean; label: string };
  };
}

interface FormConfig {
  validation: Record<string, any>;
  workflowTriggers: Record<string, string[]>;
}

interface FormComponentProps {
  schema: { fields: SchemaField[] };
  displayConfig: DisplayConfig;
  formConfig: FormConfig;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
  onSave?: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  lookupData?: Record<string, Array<{ value: string; label: string }>>;
}

interface ValidationErrors {
  [key: string]: string[];
}

export const FormComponent: React.FC<FormComponentProps> = ({
  schema,
  displayConfig,
  formConfig,
  initialData = {},
  mode = 'create',
  onSave,
  onCancel,
  lookupData = {}
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create field lookup map for easy access
  const fieldMap = schema.fields.reduce((map, field) => {
    map[field.name] = field;
    return map;
  }, {} as Record<string, SchemaField>);

  // Initialize form data with defaults
  useEffect(() => {
    if (mode === 'create') {
      const defaultData = schema.fields.reduce((data, field) => {
        if (field.default && field.default !== 'NULL' && field.default !== null) {
          if (field.default === 'now()') {
            data[field.name] = new Date().toISOString().slice(0, 16);
          } else {
            data[field.name] = field.default;
          }
        }
        return data;
      }, {} as Record<string, any>);
      
      setFormData({ ...defaultData, ...initialData });
    } else {
      setFormData(initialData);
    }
  }, [schema, initialData, mode]);

  // Validation function
  const validateField = (fieldName: string, value: any): string[] => {
    const field = fieldMap[fieldName];
    if (!field) return [];

    const fieldErrors: string[] = [];

    // Check validation rules from schema
    field.validationRules.forEach(rule => {
      if (rule === 'required' && (!value || value === '')) {
        fieldErrors.push(`${field.name} is required`);
      }
      
      if (rule.startsWith('maxLength:')) {
        const maxLength = parseInt(rule.split(':')[1]);
        if (value && value.length > maxLength) {
          fieldErrors.push(`${field.name} must be ${maxLength} characters or less`);
        }
      }
      
      if (rule.startsWith('minLength:')) {
        const minLength = parseInt(rule.split(':')[1]);
        if (value && value.length < minLength) {
          fieldErrors.push(`${field.name} must be at least ${minLength} characters`);
        }
      }
      
      if (rule === 'type:number' && value && isNaN(Number(value))) {
        fieldErrors.push(`${field.name} must be a number`);
      }
    });

    // Check form config validation
    const configValidation = formConfig.validation[fieldName];
    if (configValidation) {
      if (configValidation.required && (!value || value === '')) {
        fieldErrors.push(`${field.name} is required`);
      }
      if (configValidation.minLength && value && value.length < configValidation.minLength) {
        fieldErrors.push(`${field.name} must be at least ${configValidation.minLength} characters`);
      }
      if (configValidation.maxLength && value && value.length > configValidation.maxLength) {
        fieldErrors.push(`${field.name} must be ${configValidation.maxLength} characters or less`);
      }
    }

    return fieldErrors;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName]);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear field errors on change
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Trigger onChange workflow if defined
    if (formConfig.workflowTriggers.onChange) {
      // This would trigger your workflow system
      console.log('Triggering onChange workflows:', formConfig.workflowTriggers.onChange);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave?.(formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual field based on schema metadata
  const renderField = (fieldConfig: FormSection['fields'][0]) => {
    const field = fieldMap[fieldConfig.name];
    if (!field) return null;

    const value = formData[fieldConfig.name] || '';
    const fieldErrors = errors[fieldConfig.name] || [];
    const hasErrors = fieldErrors.length > 0;
    const isReadonly = mode === 'view' || field.primaryKey;

    // Skip rendering audit fields in create mode
    if (mode === 'create' && ['id', 'created_at', 'updated_at', 'deleted_at'].includes(field.name)) {
      return null;
    }

    const commonInputProps = {
      id: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleFieldChange(field.name, e.target.value),
      disabled: isReadonly,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasErrors ? 'border-red-500' : 'border-gray-300'
      } ${isReadonly ? 'bg-gray-100' : ''}`
    };

    // Render foreign key selects
    if (field.foreignKey) {
      const options = lookupData[field.foreignKey.mapping] || [];
      
      return (
        <div key={field.name} className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {fieldConfig.label}
            {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select {...commonInputProps}>
            <option value="">Select {fieldConfig.label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasErrors && (
            <div className="mt-1 text-red-500 text-sm">
              {fieldErrors.map(error => <div key={error}>{error}</div>)}
            </div>
          )}
        </div>
      );
    }

    // Render based on UI type
    switch (field.uiType) {
      case 'text':
        if (field.type === 'TEXT') {
          // Large text fields - use textarea
          return (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                {fieldConfig.label}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                {...commonInputProps}
                rows={4}
                maxLength={field.inputProps?.maxLength}
              />
              {hasErrors && (
                <div className="mt-1 text-red-500 text-sm">
                  {fieldErrors.map(error => <div key={error}>{error}</div>)}
                </div>
              )}
            </div>
          );
        } else {
          // Regular text input
          return (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                {fieldConfig.label}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                {...commonInputProps}
                maxLength={field.inputProps?.maxLength}
              />
              {hasErrors && (
                <div className="mt-1 text-red-500 text-sm">
                  {fieldErrors.map(error => <div key={error}>{error}</div>)}
                </div>
              )}
            </div>
          );
        }

      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              {...commonInputProps}
              onChange={(e) => handleFieldChange(field.name, e.target.value ? Number(e.target.value) : '')}
            />
            {hasErrors && (
              <div className="mt-1 text-red-500 text-sm">
                {fieldErrors.map(error => <div key={error}>{error}</div>)}
              </div>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="datetime-local"
              {...commonInputProps}
            />
            {hasErrors && (
              <div className="mt-1 text-red-500 text-sm">
                {fieldErrors.map(error => <div key={error}>{error}</div>)}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.name}
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                disabled={isReadonly}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700">
                {fieldConfig.label}
              </label>
            </div>
            {hasErrors && (
              <div className="mt-1 text-red-500 text-sm">
                {fieldErrors.map(error => <div key={error}>{error}</div>)}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              {...commonInputProps}
            />
            {hasErrors && (
              <div className="mt-1 text-red-500 text-sm">
                {fieldErrors.map(error => <div key={error}>{error}</div>)}
              </div>
            )}
          </div>
        );
    }
  };

  // Render form sections
  const renderSection = (section: FormSection) => (
    <div key={section.title} className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
        {section.title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.fields.map(fieldConfig => renderField(fieldConfig))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {displayConfig.actions[mode]?.label || 'Form'} - {displayConfig.entityName}
        </h2>
        {mode === 'view' && (
          <p className="text-sm text-gray-500 mt-1">Read-only view</p>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {displayConfig.form.sections.map(section => renderSection(section))}

        {/* Form Actions */}
        {mode !== 'view' && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
            </button>
          </div>
        )}
      </form>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 p-4 bg-gray-50 rounded border">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <strong>Form Data:</strong>
              <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
            {Object.keys(errors).length > 0 && (
              <div>
                <strong>Validation Errors:</strong>
                <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

export default FormComponent;