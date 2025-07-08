import React, { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import LoginView from './LoginView.jsx';
import { LoginPresenter } from './LoginPresenter.js';
import { createLogger } from '@whatsfresh/shared-imports';
import { useAppNavigation } from '../../../utils/navigation.js';

const log = createLogger('LoginForm');

const LoginForm = ({ 
  onLoginSuccess, 
  logoSrc, 
  appName = "WhatsFresh",
  navigateToApp,
  routes
}) => {
  const navigation = useAppNavigation(routes);
  console.count('LoginForm component render');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Create presenter instance outside render cycle
  const presenterRef = useRef(null);
  
  useEffect(() => {
    // Initialize presenter only once
    if (!presenterRef.current) {
      presenterRef.current = new LoginPresenter();
    }
  }, []);
  
  // Use the ref instead of creating a new instance on every render
  const presenter = presenterRef.current || new LoginPresenter();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      log.info('Login attempt with:', { email: values.email });
      
      // Call presenter with direct credentials
      const result = await presenter.handleLogin({
        email: values.email,
        password: values.password
      });
      
      if (result) {
        log.info('Login successful');
        setSuccess(true);
        
        // Call custom success handler if provided
        if (onLoginSuccess) {
          onLoginSuccess(result);
        }
        
        // Navigate to app - use custom function or app-aware navigation
        try {
          if (navigateToApp) {
            log.info('Using custom navigation function');
            navigateToApp();
          } else if (navigation) {
            log.info('Using app-aware navigation to dashboard');
            navigation.goToDashboard();
          } else {
            log.warn('No navigation configured - staying on login page');
          }
          log.info('Navigation command executed');
        } catch (navError) {
          log.error('Navigation failed with error:', navError);
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      log.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <>
      <LoginView 
        onLogin={handleLogin}
        loading={loading}
        error={error}
        logoSrc={logoSrc}
        appName={appName}
      />
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">Login successful!</Alert>
      </Snackbar>
    </>
  );
};

export default LoginForm;