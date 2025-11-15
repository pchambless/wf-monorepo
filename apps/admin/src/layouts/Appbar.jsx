import React from 'react';

const Appbar = ({ config, onLogout }) => {
  const styles = {
    appbar: {
      display: 'flex',
      alignItems: 'center',
      height: '64px',
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '0 16px',
      borderBottom: '1px solid #ddd',
      gap: '16px',
    },
    logo: {
      fontSize: '24px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      flexGrow: 1,
    },
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoutButton: {
      padding: '8px 16px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.3)',
      color: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.appbar}>
      {config?.logo && <div style={styles.logo}>{config.logo}</div>}
      <div style={styles.title}>{config?.title || 'WhatsFresh'}</div>

      {config?.showUserMenu && (
        <div style={styles.userMenu}>
          {config.userName && <span>{config.userName}</span>}
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Appbar;
