import React from "react";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";

/**
 * Simple Select component that takes options array
 * Compatible with existing form patterns
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
  size = "small",
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <FormControl
        fullWidth={fullWidth}
        size={size}
        error={error}
        disabled={disabled}
      >
        <InputLabel>{label}</InputLabel>
        <MuiSelect
          value={value || ""}
          onChange={handleChange}
          label={label}
          required={required}
          {...props}
        >
          {(options || []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                {option.icon && (
                  <Typography sx={{ mr: 1 }}>{option.icon}</Typography>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">{option.label}</Typography>
                  {option.description && (
                    <Typography variant="caption" color="textSecondary">
                      {option.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </MuiSelect>
        {helperText && (
          <Typography
            variant="caption"
            color={error ? "error" : "textSecondary"}
            sx={{ mt: 0.5, ml: 1 }}
          >
            {helperText}
          </Typography>
        )}
      </FormControl>
    </Box>
  );
};

export default Select;
