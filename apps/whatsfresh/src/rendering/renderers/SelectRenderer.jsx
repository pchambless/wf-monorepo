import React, { useState, useEffect } from 'react';
import { execEvent } from '@whatsfresh/shared-imports';

export const renderSelect = (component, eventTypeConfig, formData, setFormData, dataStore, currentFormId) => {
  const { id, comp_type, props = {} } = component;
  const config = eventTypeConfig[comp_type]?.config || {};
  
  // Get configuration from eventType config
  const qryName = config.qryName;
  const placeholder = config.placeholder || 'Select...';
  
  // Standardized column names: all select queries return 'value' and 'label'
  const valueKey = 'value';
  const labelKey = 'label';
  
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load options from eventSQL query
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const result = await execEvent(qryName, {});
        setOptions(result.data || []);
      } catch (error) {
        console.error(`Failed to load options for ${comp_type}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (qryName) {
      loadOptions();
    }
  }, [qryName, comp_type]);
  
  // Get current value from formData or dataStore
  const fieldName = props.name || comp_type.toLowerCase();
  const loadedValue = currentFormId && dataStore[currentFormId]
    ? (Array.isArray(dataStore[currentFormId]) 
        ? dataStore[currentFormId][0]?.[fieldName] 
        : dataStore[currentFormId]?.[fieldName])
    : undefined;
  
  const currentValue = formData[fieldName] ?? loadedValue ?? '';
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: e.target.value,
    }));
  };
  
  return (
    <select
      key={id}
      name={fieldName}
      value={currentValue}
      onChange={handleChange}
      disabled={loading}
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: loading ? '#f5f5f5' : 'white',
        cursor: loading ? 'wait' : 'pointer',
        ...props.style,
      }}
    >
      <option value="">{loading ? 'Loading...' : placeholder}</option>
      {options.map((option) => (
        <option key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  );
};

export const isSelectComponent = (comp_type) => {
  return ['SelBrand', 'SelVendor', 'SelMeasure'].includes(comp_type);
};
