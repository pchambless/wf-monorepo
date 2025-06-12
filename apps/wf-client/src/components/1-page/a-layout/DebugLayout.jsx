import React from 'react';
import { Box, Typography } from '@mui/material';

const DebugLayout = ({ children }) => {
  console.log("DebugLayout children:", !!children, children);
  
  return (
    <Box sx={{ p: 3, border: '3px solid red', minHeight: '100vh' }}>
      <Typography variant="h3" color="error">DEBUG LAYOUT</Typography>
      <Box sx={{ p: 2, border: '2px dashed blue', my: 2 }}>
        {children || <Typography color="error">NO CHILDREN!</Typography>}
      </Box>
    </Box>
  );
};

export default DebugLayout;
