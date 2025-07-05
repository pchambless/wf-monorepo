import React, { useState } from 'react';
import { createLogger } from '@whatsfresh/shared-imports';
import navService from '../../../services/navService';
// TODO: Fix assets path after resolving main compilation issues
// import logo from '@assets/wf-icon.png';

const log = createLogger('Login');

// Temporary simple login component to bypass JSX parsing issues
const SimpleLoginForm = ({ onLoginSuccess, onNavigateToApp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login for now
    log.info('Login attempt with:', email);
    if (onLoginSuccess) onLoginSuccess({ email });
    if (onNavigateToApp) onNavigateToApp();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

const Login = () => {
  const handleLoginSuccess = (result) => {
    log.info('Login successful, handling client-specific logic');
  };

  const navigateToApp = () => {
    log.info('Navigating to dashboard using navService');
    navService.afterLogin();
  };

  return (
    <SimpleLoginForm 
      onLoginSuccess={handleLoginSuccess}
      onNavigateToApp={navigateToApp}
    />
  );
}; 
      onLoginSuccess={handleLoginSuccess}
      navigateToApp={navigateToApp}
      // logoSrc={logo} // TODO: Re-enable after fixing assets import
      appName="WhatsFresh Client"
    />
  );
};

export default Login;
