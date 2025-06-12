import React, { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import LoginView from './View';
import { LoginPresenter } from './Presenter';
import createLogger from '../../../utils/logger';
// Import navService
import navService from '../../../services/navService';

const log = createLogger('Login');

const Login = () => {
  console.count('Login component render');

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
        
        try {
          log.info('Navigating to dashboard using navService');
          
          // Use navService instead of direct window.location
          navService.afterLogin();
          // Or use the more general method:
          // navService.to('dashList');
          
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

export default Login;
