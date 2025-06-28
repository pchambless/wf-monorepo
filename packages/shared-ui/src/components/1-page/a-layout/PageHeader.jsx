import React from 'react';
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * Standardized page header with title, description, and optional actions
 */
const PageHeader = ({ 
  title,
  description,
  icon: Icon,
  actions,
  helpText,
  onHelp,
  selectors  // New prop for selectors
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: description ? 1 : 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {Icon && (
            <Box sx={{ mr: 1.5, color: 'primary.main' }}>
              <Icon fontSize="large" />
            </Box>
          )}
          
          <Typography variant="h4" component="h1" fontWeight="500">
            {title}
          </Typography>
          
          {helpText && (
            <Tooltip title={helpText}>
              <IconButton 
                size="small" 
                onClick={onHelp}
                sx={{ ml: 1 }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Box>
      
      {description && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 1.5 }}
        >
          {description}
        </Typography>
      )}
      
      <Divider />
      
      {/* Add selectors below the divider if provided */}
      {selectors && (
        <Box sx={{ mt: 2, mb: 1 }}>
          {selectors}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
