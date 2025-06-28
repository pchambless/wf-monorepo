import React from 'react';
import { Box, Paper } from '@mui/material';

/**
 * Content area wrapper with consistent styling
 * Provides padding and background for page content
 */
const PageContent = ({ 
  children,
  withPaper = true,
  maxWidth,
  compactMode = true,  // Add this new prop 
  sx = {}
}) => {
  const content = (
    <Box 
      sx={{ 
        p: withPaper ? (compactMode ? 1 : 3) : (compactMode ? 0.5 : 2),
        ...sx
      }}
    >
      {children}
    </Box>
  );
  
  // Wrap in Paper for elevated appearance if specified
  if (withPaper) {
    return (
      <Box sx={{ maxWidth }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: compactMode ? 1 : 3,
            bgcolor: 'background.paper',
            height: '100%'
          }}
        >
          {content}
        </Paper>
      </Box>
    );
  }
  
  // Otherwise just return content in Box
  return (
    <Box sx={{ maxWidth }}>
      {content}
    </Box>
  );
};

export default PageContent;
