import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';

/**
 * Layout for authentication pages (login)
 * Simple, focused design without navigation elements
 */
const AuthLayout = () => {
  return (
    <Box 
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={4}
          sx={{ 
            p: 4, 
            borderRadius: 2,
            boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)'
          }}
        >
          <Box 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            <img 
              src="/logo.png" 
              alt="WhatsFresh" 
              style={{ height: '80px' }} 
            />
          </Box>
          
          {/* Router outlet renders children */}
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
