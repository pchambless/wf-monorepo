import React from 'react';

const LoginPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Studio Login</h1>
        <p style={styles.message}>Login functionality coming soon...</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8fafc',
  },
  loginBox: {
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
};

export default LoginPage;