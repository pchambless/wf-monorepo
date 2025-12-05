import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PageRenderer from './rendering/PageRenderer';
import { fetchPageConfig, fetchEventTypeConfig } from './utils/fetchConfig';

const PageWrapper = ({ pageName, eventTypeConfig }) => {
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

  return <PageRenderer config={pageConfig} eventTypeConfig={eventTypeConfig} />;
};

const App = () => {
  const appName = process.env.REACT_APP_NAME || 'app';
  const [eventTypeConfig, setEventTypeConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        console.log('📦 Loading eventTypeConfig at startup...');
        const eventTypes = await fetchEventTypeConfig();
        console.log('✅ Loaded eventTypeConfig:', Object.keys(eventTypes).length, 'types');
        setEventTypeConfig(eventTypes);
      } catch (err) {
        console.error('Failed to load eventType config:', err);
        setEventTypeConfig({}); // Use empty object as fallback
      } finally {
        setLoading(false);
      }
    };

    loadAppConfig();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        Loading app configuration...
      </div>
    );
  }

  return (
    <AppLayout appName={appName}>
      <Routes>
        <Route path="/" element={<PageWrapper pageName={`${appName}/dashboard`} eventTypeConfig={eventTypeConfig} />} />
        <Route path="/:pageName" element={<DynamicPageWrapper eventTypeConfig={eventTypeConfig} />} />
      </Routes>
    </AppLayout>
  );
};

const DynamicPageWrapper = ({ eventTypeConfig }) => {
  const { pageName } = useParams();
  const appName = process.env.REACT_APP_NAME || 'app';
  return <PageWrapper pageName={`${appName}/${pageName}`} eventTypeConfig={eventTypeConfig} />;
};

export default App;
