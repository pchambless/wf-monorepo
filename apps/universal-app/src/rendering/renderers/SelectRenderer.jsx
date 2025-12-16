import React, { useState, useEffect } from 'react';
import { execEvent } from '../../utils/api';
import { createLogger } from '../../utils/logger.js';
import { selectFieldResolver } from '../utils/FormDataResolver.js';

const log = createLogger('SelectRenderer', 'info');

export const renderSelect = (component, eventTypeConfig, formData, setFormData, dataStore, currentFormId, contextStore = {}) => {
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
  
  // State to hold resolved fetchParams
  const [resolvedFetchParams, setResolvedFetchParams] = React.useState({});

  // Resolve fetchParams templates with database contextStore values
  React.useEffect(() => {
    let isMounted = true;
    
    const resolveFetchParams = async () => {
      const resolved = {};
      
      for (const [key, value] of Object.entries(fetchParams)) {
        if (typeof value === 'string' && value.includes('{{contextStore.')) {
          // Extract contextStore key from template like "{{contextStore.appID}}"
          const match = value.match(/\{\{contextStore\.(\w+)\}\}/);
          if (match) {
            const contextKey = match[1];
            try {
              // Fetch the actual value from database context_store
              const { getVals } = await import('../../utils/api.js');
              const result = await getVals([contextKey]);
              const contextValue = result?.[0]?.[contextKey];
              resolved[key] = contextValue;
              log.debug(`Select ${id}: Resolved ${key} = ${contextValue} from database contextStore.${contextKey}`);
            } catch (error) {
              log.error(`Select ${id}: Failed to resolve contextStore.${contextKey}:`, error);
              resolved[key] = null;
            }
          } else {
            resolved[key] = value;
          }
        } else {
          resolved[key] = value;
        }
      }
      
      if (isMounted) {
        setResolvedFetchParams(resolved);
      }
    };

    // Only resolve fetchParams if we actually have fetchParams to resolve
    if (Object.keys(fetchParams).length > 0) {
      resolveFetchParams();
    }

    // Extract specific contextStore keys this component depends on
    const contextKeys = Object.values(fetchParams)
      .filter(val => typeof val === 'string' && val.includes('{{contextStore.'))
      .map(val => {
        const match = val.match(/\{\{contextStore\.(\w+)\}\}/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    if (contextKeys.length > 0) {
      // Create a custom event listener for contextStore changes
      const handleContextStoreChange = (event) => {
        const { key, value } = event.detail;
        if (contextKeys.includes(key) && isMounted) {
          log.debug(`Select ${id}: Context key ${key} changed to ${value}, refreshing fetchParams`);
          resolveFetchParams();
        }
      };

      // Listen for contextStore change events
      window.addEventListener('contextStoreChange', handleContextStoreChange);
      
      return () => {
        isMounted = false;
        window.removeEventListener('contextStoreChange', handleContextStoreChange);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(fetchParams), id]); // Use JSON.stringify to prevent object reference issues

  // Load options using enhanced OptionsCache LUOW
  useEffect(() => {
    let isMounted = true;
    
    const loadOptions = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        if (qryName && Object.keys(resolvedFetchParams).length > 0) {
          // Only load if we have resolved fetchParams (for dependent selects)
          const hasRequiredParams = Object.values(resolvedFetchParams).every(val => val != null);
          if (hasRequiredParams) {
            log.info(`Select ${id}: Loading options with params:`, resolvedFetchParams);
            const options = await selectFieldResolver.loadOptions(qryName, id, cacheTTL, resolvedFetchParams);
            if (isMounted) {
              setOptions(options);
            }
            
            // Log cache stats for debugging in development
            if (process.env.NODE_ENV === 'development') {
              const stats = selectFieldResolver.getCacheStats();
              log.debug(`Select ${id} cache stats:`, stats);
            }
          } else {
            log.info(`Select ${id}: Waiting for required parameters:`, resolvedFetchParams);
            if (isMounted) {
              setOptions([]);
            }
          }
        } else if (qryName && Object.keys(fetchParams).length === 0) {
          // Load options for selects without dependencies
          const options = await selectFieldResolver.loadOptions(qryName, id, cacheTTL, {});
          if (isMounted) {
            setOptions(options);
          }
        } else {
          log.warn(`Select ${id} has no qryName or waiting for fetchParams resolution`);
          if (isMounted) {
            setOptions([]);
          }
        }
      } catch (error) {
        log.error(`Failed to load options for ${comp_type}:`, error);
        if (isMounted) {
          setOptions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Only load options if we have a qryName
    if (qryName) {
      loadOptions();
    }
    
    return () => {
      isMounted = false;
    };
  }, [qryName, comp_type, id, cacheTTL, JSON.stringify(resolvedFetchParams)]);  // Depends on resolved params
  
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
  
  const handleChange = async (e) => {
    const newValue = e.target.value;
    
    // Update formData
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
    
    // Execute setVals trigger if configured
    if (props.setVals) {
      try {
        const [paramName, paramValueTemplate] = props.setVals;
        const resolvedValue = paramValueTemplate.replace('{{this.value}}', newValue);
        
        log.info(`Select ${id}: Executing setVals trigger: ${paramName} = ${resolvedValue}`);
        const { setVals } = await import('../../utils/api.js');
        const result = await setVals([{ paramName, paramVal: resolvedValue }]);
        log.info(`Select ${id}: Successfully executed setVals trigger`, result);
        
        // Dispatch contextStore change event for dependent components
        window.dispatchEvent(new CustomEvent('contextStoreChange', {
          detail: { key: paramName, value: resolvedValue }
        }));
      } catch (error) {
        log.error(`Select ${id}: Failed to execute setVals trigger:`, error);
      }
    }
    
    // Legacy contextKey support (for backward compatibility)
    if (contextKey && !props.setVals) {
      try {
        log.info(`Select ${id}: Using legacy contextKey: ${contextKey} = ${newValue}`);
        const { setVals } = await import('../../utils/api.js');
        const result = await setVals([{ paramName: contextKey, paramVal: newValue }]);
        log.info(`Select ${id}: Successfully updated contextStore via contextKey`, result);
        
        // Dispatch contextStore change event for dependent components
        window.dispatchEvent(new CustomEvent('contextStoreChange', {
          detail: { key: contextKey, value: newValue }
        }));
      } catch (error) {
        log.error(`Select ${id}: Failed to update contextStore via contextKey:`, error);
      }
    }
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
export const SelectComponent = ({ component, formData, setFormData, dataStore, currentFormId, contextStore }) => {
  const log = createLogger('SelectComponent', 'info');
  log.info(`SelectComponent called for ${component.id} with contextStore:`, contextStore);
  log.info(`SelectComponent props for ${component.id}:`, component.props);
  return renderSelect(component, {}, formData, setFormData, dataStore, currentFormId, contextStore);
};
