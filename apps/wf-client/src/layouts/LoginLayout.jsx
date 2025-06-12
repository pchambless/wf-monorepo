import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

/**
 * Centered layout for login and other authentication pages
 */
const LoginLayout = ({ children, title }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box mb={4} display="flex" flexDirection="column" alignItems="center">
            <img 
              src="/logo.png" 
              alt="WhatsFresh Logo" 
              style={{ height: 60, marginBottom: 16 }} 
            />
            <Typography variant="h5">WhatsFresh</Typography>
          </Box>
          {title && (
            <Typography variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          {children}
        </Paper>
      </Container>
      <Box 
        position="absolute" 
        bottom={0} 
        width="100%" 
        p={2} 
        textAlign="center"
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} WhatsFresh
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginLayout;
