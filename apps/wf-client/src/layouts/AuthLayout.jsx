import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

/**
 * Layout for authentication pages (login, register, password reset)
 * Provides consistent styling for all auth-related screens
 */
const AuthLayout = ({ children, title }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        // Taking the nice gradient from your AuthLayout
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={4}
          sx={{ 
            p: 4, 
            borderRadius: 2,
            boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Logo section */}
          <Box mb={4} display="flex" flexDirection="column" alignItems="center">
            <img 
              src="/logo.png" 
              alt="WhatsFresh Logo" 
              style={{ height: 60, marginBottom: 16 }} 
            />
            <Typography variant="h5">WhatsFresh</Typography>
          </Box>
          
          {/* Optional title */}
          {title && (
            <Typography variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
          )}
          
          {/* Content */}
          {children}
        </Paper>
      </Container>
      
      {/* Footer from LoginLayout */}
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

export default AuthLayout;