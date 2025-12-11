import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PageRenderer from './rendering/PageRenderer';
import { fetchPageStructure, fetchEventTypeConfig } from './utils/fetchConfig';
import { setVals, execEvent } from '@whatsfresh/shared-imports';

const PageWrapper = ({ pageID, eventTypeConfig }) => {
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPageStructure = async () => {
      try {
        const structure = await fetchPageStructure(pageID);
        setPageConfig(structure);
      } catch (err) {
        console.error(`Failed to load page structure for pageID ${pageID}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPageStructure();
  }, [pageID]);

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
  const appName = window.location.pathname.split('/')[1] || process.env.REACT_APP_NAME || 'app';
  const [eventTypeConfig, setEventTypeConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        const sessionCheck = await fetch('http://localhost:3002/api/auth/session', {
          credentials: 'include'
        });

        if (!sessionCheck.ok) {
          console.log('❌ No valid session - redirecting to login');
          window.location.href = 'http://localhost:3002/login.html';
          return;
        }

        const sessionData = await sessionCheck.json();
        console.log('✅ Session valid:', sessionData.email);

        console.log('📦 Loading eventTypeConfig at startup...');
        const eventTypes = await fetchEventTypeConfig();
        console.log('✅ Loaded eventTypeConfig:', Object.keys(eventTypes).length, 'types');
        setEventTypeConfig(eventTypes);
      } catch (err) {
        console.error('Failed to load app config:', err);
        window.location.href = 'http://localhost:3002/login.html';
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
        <Route path="/:appName" element={<PageWrapper pageID={1} eventTypeConfig={eventTypeConfig} />} />
        <Route path="/page/:pageID" element={<DirectPageWrapper eventTypeConfig={eventTypeConfig} />} />
        <Route path="/:appName/:pageName" element={<DynamicPageWrapper eventTypeConfig={eventTypeConfig} />} />
      </Routes>
    </AppLayout>
  );
};

const DirectPageWrapper = ({ eventTypeConfig }) => {
  const { pageID } = useParams();
  return <PageWrapper pageID={parseInt(pageID, 10)} eventTypeConfig={eventTypeConfig} />;
};

const DynamicPageWrapper = ({ eventTypeConfig }) => {
  const { appName, pageName } = useParams();
  return <PageWrapperByName appName={appName} pageName={pageName} eventTypeConfig={eventTypeConfig} />;
};

const PageWrapperByName = ({ appName, pageName, eventTypeConfig }) => {
  const [pageID, setPageID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const lookupPageID = async () => {
      try {
        setLoading(true);
        setError(null);
        const routePath = `/${appName}/${pageName}`;
        console.log(`🔍 Looking up pageID for routePath: ${routePath}`);

        // First set routePath in session context using shared API
        await setVals([
          { paramName: 'routePath', paramVal: routePath }
        ]);
        console.log('✅ setVals successful');

        // Query vw_routePath to get pageID from routePath using shared API
        const data = await execEvent('fetchPageByRoutePath');
        console.log('📦 execEvent response:', data);
        if (!data.data || data.data.length === 0) {
          throw new Error(`Page not found: ${routePath}`);
        }

        const foundPageID = data.data[0].pageID;
        console.log(`✅ Found pageID: ${foundPageID} for ${routePath}`);
        setPageID(foundPageID);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to lookup page:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    lookupPageID();
  }, [appName, pageName]);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        Looking up page...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <h3>Page Not Found</h3>
        <p>{error}</p>
      </div>
    );
  }

  return <PageWrapper pageID={pageID} eventTypeConfig={eventTypeConfig} />;
};

export default App;
