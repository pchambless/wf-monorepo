import React, { useState, useEffect } from 'react';
import { Box, FormControl, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
// Import execEvent from our API layer
import { execEvent } from '../../api/index.js';
import contextStore from '../../stores/contextStore.js';

/**
 * Base component for all selection widgets
 */
export const SelectWidget = ({ 
  id,
  eventName,     // Event to call for data loading
  valueKey,      // Field for value (e.g., "brndID")
  labelKey,      // Field for display (e.g., "brndName") 
  params = {},   // Additional parameters for the event
  
  // Standard props
  size = 'SM',
  data = null,   // Optional direct data provision
  value = null,
  onChange,
  label,
  placeholder = "Select...",
  required = false,
  disabled = false,
  ...props
}) => {
  // Note: accountStore removed - widgets should pass all required params explicitly
  
  // Component state
  const [selectedId, setSelectedId] = useState(value);
  const [items, setItems] = useState(data || []);
  const [loading, setLoading] = useState(!data && !!eventName);
  const [error, setError] = useState(null);
  
  // Load data if not provided directly
  useEffect(() => {
    // Skip if data was provided or no event name
    if (data || !eventName) {
      setItems(data || []);
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        // execEvent now auto-resolves parameters from contextStore
        // Manual params still supported for overrides
        const result = await execEvent(eventName, params);
        
        // Handle successful data load
        setItems(result || []);
        setError(null);
      } catch (err) {
        console.error(`Error loading data for ${id}:`, err);
        setError(`Failed to load data: ${err.message}`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [
    data, 
    eventName, 
    // Stringify params to react properly to object changes
    JSON.stringify(params) 
  ]);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== null && value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);
  
  // Handle selection change
  const handleChange = (e) => {
    const newId = e.target.value;
    setSelectedId(newId);
    
    // Store selection in contextStore for hierarchical parameter resolution
    if (eventName && newId) {
      contextStore.setEvent(eventName, newId);
    }
    
    if (onChange) {
      const selectedItem = items.find(item => 
        String(item[valueKey]) === String(newId)
      );
      onChange(newId, selectedItem);
    }
  };
  
  // Find current selected item
  const currentItem = items.find(item => 
    String(item[valueKey]) === String(selectedId)
  );
  
  return (
    <Box sx={{ p: 2 }} data-widget-id={id} data-widget-size={size}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {label}
        </Typography>
      )}
      
      <FormControl fullWidth 
        size={size === 'SM' ? 'small' : 'medium'} 
        required={required}
        error={!!error}
      >
        <Select
          value={selectedId || ''}
          onChange={handleChange}
          sx={{ bgcolor: 'background.paper' }}
          displayEmpty
          disabled={disabled || loading}
          renderValue={() => {
            if (loading) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </Box>
              );
            }
            
            if (error) return `Error: ${error}`;
            return currentItem ? currentItem[labelKey] : placeholder;
          }}
          {...props}
        >
          {items.map(item => (
            <MenuItem key={item[valueKey]} value={item[valueKey]}>
              {item[labelKey]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectWidget;