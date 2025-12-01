import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DirectRenderer from './components/DirectRenderer';
import { fetchPageConfig } from './utils/fetchConfig';

const PageWrapper = ({ pageName }) => {
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPageConfig = async () => {
      try {
        const config = await fetchPageConfig(pageName);
        setPageConfig(config);
      } catch (err) {
        console.error(`Failed to load page config for ${pageName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPageConfig();
  }, [pageName]);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        Loading page...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <h3>Error loading page</h3>
        <p>{error}</p>
      </div>
    );
  }

  return <DirectRenderer pageConfig={pageConfig} />;
};

const App = () => {
  const appName = process.env.REACT_APP_NAME || 'app';

  return (
    <AppLayout appName={appName}>
      <Routes>
        <Route path="/" element={<PageWrapper pageName={`${appName}/dashboard`} />} />
        <Route path="/:pageName" element={<PageWrapper pageName={`${appName}/:pageName`} />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
