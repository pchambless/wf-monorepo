import React, { useState, useEffect } from "react";
import {
  Box,
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
// Import execEvent from our API layer
import { execEvent } from "../../api/index.js";
import contextStore from "../../stores/contextStore.js";

/**
 * Base component for all selection widgets
 */
export const SelectWidget = ({
  id,
  eventName, // Event to call for data loading
  valueKey, // Field for value (optional - auto-detected as first column)
  labelKey, // Field for display (optional - auto-detected as second column)
  params = {}, // Additional parameters for the event

  // Standard props
  size = "SM",
  data = null, // Optional direct data provision
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
  const [autoValueKey, setAutoValueKey] = useState(null);
  const [autoLabelKey, setAutoLabelKey] = useState(null);

  // Initialize from contextStore if no value provided
  React.useEffect(() => {
    if (!value && eventName && contextStore) {
      const storedValue = contextStore.getParameter(eventName);
      if (storedValue) {
        setSelectedId(storedValue);
      }
    }
  }, [eventName, value]);

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

        // Auto-detect field keys if not provided and we have data
        if (!valueKey || !labelKey) {
          if (result && result.length > 0) {
            const firstRow = result[0];
            const fieldNames = Object.keys(firstRow);

            if (!valueKey && fieldNames.length > 0) {
              setAutoValueKey(fieldNames[0]); // First column as value
            }
            if (!labelKey && fieldNames.length > 1) {
              setAutoLabelKey(fieldNames[1]); // Second column as label
            }
          }
        }

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
    JSON.stringify(params),
  ]);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== null && value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  // Get effective field keys (manual override or auto-detected)
  const effectiveValueKey = valueKey || autoValueKey;
  const effectiveLabelKey = labelKey || autoLabelKey;

  // Handle selection change
  const handleChange = (event, newValue) => {
    const newId = newValue ? newValue[effectiveValueKey] : null;
    setSelectedId(newId);

    // Store selection in contextStore for hierarchical parameter resolution
    if (eventName && newId) {
      contextStore.setEvent(eventName, newId);
    }

    if (onChange) {
      onChange(newId, newValue);
    }
  };

  // Find current selected item
  const currentItem = items.find(
    (item) => String(item[effectiveValueKey]) === String(selectedId)
  );

  // Extract sx and other styling props from props
  const { sx, fullWidth, ...autocompleteProps } = props;

  return (
    <Box
      sx={{
        p: 2,
        width: fullWidth ? "100%" : "auto",
        ...(sx || {}),
      }}
      data-widget-id={id}
      data-widget-size={size}
    >
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          {label}
        </Typography>
      )}

      <Autocomplete
        value={currentItem || null}
        onChange={handleChange}
        options={items}
        getOptionLabel={(option) => option[effectiveLabelKey] || ""}
        getOptionKey={(option) => option[effectiveValueKey]}
        loading={loading}
        disabled={disabled}
        size={size === "SM" ? "small" : "medium"}
        sx={{ minWidth: '300px' }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={!!error}
            helperText={error}
            required={required}
            sx={{}}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={50} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option[effectiveValueKey]}>
            {option[effectiveLabelKey]}
          </li>
        )}
        noOptionsText={error ? `Error: ${error}` : "No options"}
        {...autocompleteProps}
      />
    </Box>
  );
};

export default SelectWidget;
