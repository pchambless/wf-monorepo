import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '@components/Logo';

const SidebarHeader = () => {
  return (
    <Box 
      component={RouterLink}
      to="/welcome"
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        textDecoration: 'none',
        color: 'text.primary'
      }}
    >
      <Logo sx={{ width: 40, height: 40 }} />
      <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
        WhatsFresh
      </Typography>
    </Box>
  );
};

export default SidebarHeader;
