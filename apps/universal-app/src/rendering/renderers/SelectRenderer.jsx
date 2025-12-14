import React, { useState, useEffect } from 'react';
import { execEvent } from '../../utils/api';
import { createLogger } from '../../utils/logger.js';
import { selectFieldResolver } from '../utils/FormDataResolver.js';

const log = createLogger('SelectRenderer', 'info');

export const renderSelect = (component, eventTypeConfig, formData, setFormData, dataStore, currentFormId) => {
  const { id, comp_type, props = {} } = component;
  
  // Get query configuration from component props  
  const {
    qryName,
    contextKey,
    name,
    placeholder = 'Select...',
    valueKey = 'value',
    labelKey = 'label',
    cacheTTL = null,  // Allow custom cache TTL per component
    fetchParams = {}  // Allow custom parameters for queries
  } = props;
  
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load options using enhanced OptionsCache LUOW
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        if (qryName) {
          // Use enhanced OptionsCache LUOW with TTL and parameters
          const options = await selectFieldResolver.loadOptions(qryName, id, cacheTTL, fetchParams);
          setOptions(options);
          
          // Log cache stats for debugging in development
          if (process.env.NODE_ENV === 'development') {
            const stats = selectFieldResolver.getCacheStats();
            log.debug(`Select ${id} cache stats:`, stats);
          }
        } else {
          log.warn(`Select ${id} has no qryName or eventType specified`);
          setOptions([]);
        }
      } catch (error) {
        log.error(`Failed to load options for ${comp_type}:`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOptions();
  }, [qryName, comp_type, id, cacheTTL, JSON.stringify(fetchParams)]);  // Enhanced dependencies including cache config
  
  // Use SelectFieldResolver LUOW for value resolution
  const fieldName = name || comp_type.toLowerCase();
  const currentValue = selectFieldResolver.resolveValue(
    fieldName, 
    formData, 
    dataStore, 
    {}, // contextStore not available in this API
    currentFormId, 
    contextKey // use contextKey from props
  );
  
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

// Export SelectComponent for compatibility with existing imports
export const SelectComponent = ({ component, formData, setFormData, dataStore, currentFormId }) => {
  return renderSelect(component, {}, formData, setFormData, dataStore, currentFormId);
};
