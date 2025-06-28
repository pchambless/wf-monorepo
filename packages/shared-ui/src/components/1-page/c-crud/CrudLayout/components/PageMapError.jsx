import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * PageMapError component - Displays errors when pageMap validation fails
 * 
 * @param {Object} props - Component props
 * @param {Array} props.errors - List of validation error messages
 */
const PageMapError = ({ errors = [] }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fff4f4' }}>
      <Typography variant="h5" sx={{ color: '#d32f2f', mb: 2 }}>
        PageMap Configuration Error
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        The current page could not be displayed because its configuration is invalid.
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
            These errors indicate issues with the pageMap configuration. Check the page
            definition and ensure all required properties are correctly specified.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PageMapError;
