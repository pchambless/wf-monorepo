import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * ConfigError component - Displays errors when configuration validation fails
 * 
 * @param {Object} props - Component props
 * @param {Array} props.errors - List of validation error messages
 * @param {string} props.title - Optional custom title
 */
const ConfigError = ({ errors = [], title = 'Configuration Error' }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fff4f4' }}>
      <Typography variant="h5" sx={{ color: '#d32f2f', mb: 2 }}>
        {title}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        The component could not be displayed because its configuration is invalid.
        Please fix the following issues:
      </Typography>
      
      <List>
        {errors.map((error, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <ErrorIcon color="error" />
            </ListItemIcon>
            <ListItemText primary={error} />
          </ListItem>
        ))}
      </List>
      
      {process.env.NODE_ENV !== 'production' && (
        <Box mt={3} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Developer Note:
          </Typography>
          <Typography variant="caption" component="div">
            These errors indicate issues with the component configuration. 
            Check that all required properties are correctly specified.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ConfigError;
