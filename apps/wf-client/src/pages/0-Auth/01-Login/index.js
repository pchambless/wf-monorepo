import React from 'react';
import { createLogger } from '@whatsfresh/shared-imports';
// Temporarily use stub until webpack config is fixed
// import { LoginForm } from '@whatsfresh/shared-ui';
import { useAccountStore } from '@stores/accountStore';
import navService from '../../../services/navService';
// TODO: Fix assets path after resolving main compilation issues
// import logo from '@assets/wf-icon.png';

const log = createLogger('Login');

// Temporary simple login component until webpack config is fixed
const SimpleLoginForm = ({ onLoginSuccess, navigateToApp, appName }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Import the login presenter directly to avoid JSX issues
      const { LoginPresenter } = await import('@whatsfresh/shared-ui/src/components/auth/LoginForm/LoginPresenter.js');
      const presenter = new LoginPresenter();

      const result = await presenter.handleLogin({ email, password });

      if (result) {
        log.info('Login successful');
        if (onLoginSuccess) onLoginSuccess(result);
        if (navigateToApp) navigateToApp();
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Sign in to {appName}</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

const Login = () => {
  const accountStore = useAccountStore();

  const handleLoginSuccess = async (userData) => {
    log.info('Login successful, user data:', userData);

    // For a generic login, we just need to set basic user authentication
    // The MainLayout will handle loading account data when the app initializes
    if (Array.isArray(userData) && userData.length > 0) {
      const user = userData[0];

      // Set basic user authentication (without accounts - MainLayout will load those)
      accountStore.setUserLoginData(user, []); // Empty accounts array for now

      log.info('Basic user data set, MainLayout will load accounts');
    }
  };

  const navigateToApp = () => {
    log.info('Navigating to dashboard using navService');
    navService.afterLogin();
  };

  return (
    <SimpleLoginForm
      onLoginSuccess={handleLoginSuccess}
      navigateToApp={navigateToApp}
      logoSrc={undefined} // TODO: Add logo once assets are resolved
      appName="WhatsFresh Client"
    />
  );
};

export default Login;
