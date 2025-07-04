import React from 'react';
import { LoginForm } from '@whatsfresh/shared-ui';
import navService from '../../../services/navService';
import logo from '@assets/wf-icon.png';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('Login');

const Login = () => {
  const handleLoginSuccess = (result) => {
    log.info('Login successful, handling client-specific logic');
  };

  const navigateToApp = () => {
    log.info('Navigating to dashboard using navService');
    navService.afterLogin();
  };

  return (
    <LoginForm 
      onLoginSuccess={handleLoginSuccess}
      navigateToApp={navigateToApp}
      logoSrc={logo}
      appName="WhatsFresh Client"
    />
  );
};

export default Login;
