import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import dataStore from '@stores/dataStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';

const log = createLogger('EntitySelector');

/**
 * Reusable entity selector component
 */
const EntitySelector = observer(({ 
  entityType,
  idField,
  listEvent,
  displayField,
  label,
  dependsOn = null,
  defaultValue = null,
  defaultRule = null,
  onChange,
  disabled = false
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedValue = accountStore.getSelectedEntity(idField) || '';
  
  // Create memoized handleChange function
  const handleChange = useCallback((value) => {
    log(`Selected ${entityType}:`, value);
    accountStore.setSelectedEntity(idField, value);
    
    if (onChange) onChange(value);
  }, [entityType, idField, onChange]);
  
  // Load entity options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const params = {};
        
        // Add dependency parameter if needed
        if (dependsOn) {
          const dependsOnValue = accountStore.getSelectedEntity(dependsOn);
          if (dependsOnValue) {
            params[`:${dependsOn}`] = dependsOnValue;
          } else {
            // Can't load without parent selection
            setOptions([]);
            setLoading(false);
            return;
          }
        }
        
        const result = await dataStore.fetchData(listEvent, null, params);
        setOptions(result || []);
        
        // Auto-select default value or first item if appropriate
        if (result?.length > 0 && !selectedValue) {
          let valueToSelect = null;
          
          // If defaultValue is provided, use it
          if (defaultValue && result.some(item => item[idField] === defaultValue)) {
            valueToSelect = defaultValue;
          } 
          // If defaultRule is "first", select first item
          else if (defaultRule === "first") {
            valueToSelect = result[0][idField];
          }
          
          if (valueToSelect) {
            handleChange(valueToSelect);
          }
        }
      } catch (error) {
        log('Error loading options:', error);
        setOptions([]);
      }
      setLoading(false);
    };
    
    fetchOptions();
  }, [listEvent, dependsOn, idField, defaultValue, defaultRule, selectedValue, handleChange]);
  
  // FIX: Only use selectedValue if options exist and include that value
  const hasValidSelection = options.length > 0 && 
    options.some(opt => opt[idField] === selectedValue);
  
  return (
    <FormControl fullWidth size="small" disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={hasValidSelection ? selectedValue : ''}
        onChange={(e) => handleChange(e.target.value)}
        label={label}
      >
        {options.map(option => (
          <MenuItem key={option[idField]} value={option[idField]}>
            {option[displayField]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

export default EntitySelector;
