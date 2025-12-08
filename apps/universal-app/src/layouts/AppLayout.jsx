import React, { useEffect, useState } from 'react';
import { fetchLayoutConfig } from '../utils/fetchConfig';
import Appbar from './Appbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AppLayout = ({ children, appName }) => {
  const [layoutConfig, setLayoutConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLayoutConfig = async () => {
      try {
        const config = await fetchLayoutConfig(appName);
        setLayoutConfig(config);
      } catch (err) {
        console.error('Failed to load layout config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (appName) {
      loadLayoutConfig();
    } else {
      setLoading(false);
    }
  }, [appName]);

  const handleLogout = () => {
    console.log('Logout clicked');
    window.location.href = '/login';
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    body: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    pagePanel: {
      flex: 1,
      overflow: 'auto',
      backgroundColor: '#fff',
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666',
    },
    error: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#d32f2f',
      flexDirection: 'column',
      gap: '12px',
    },
  };

  if (loading) {
    return <div style={styles.loading}>Loading layout...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div>Failed to load layout configuration</div>
        <div style={{ fontSize: '14px', color: '#666' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Appbar config={layoutConfig?.appbar} onLogout={handleLogout} />

      <div style={styles.body}>
        <Sidebar config={layoutConfig?.sidebar} />

        <div style={styles.pagePanel}>
          {children}
        </div>
      </div>

      <Footer config={layoutConfig?.footer} />
    </div>
  );
};

export default AppLayout;
