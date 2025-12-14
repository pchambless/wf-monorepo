import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PageRenderer from './rendering/PageRenderer';
import { fetchEventTypeConfig } from './utils/fetchConfig';
import { setVals, execEvent } from './utils/api';
import { runHealthChecks, validatePageStructure } from './utils/healthCheck';
import { initializePageRegistry, getPageByID, getPageByRoute, getPageByAppAndName } from './utils/pageRegistry';
import { navigationEfficiency } from './rendering/utils/NavigationEfficiency.js';
import { sessionCache } from './rendering/utils/SessionCache.js';

const PageWrapper = ({ pageID, eventTypeConfig }) => {
  const [pageConfig, setPageConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPageStructure = async () => {
      try {
        // NavigationEfficiency LUOW: Efficient page navigation with single context update
        const structure = await navigationEfficiency.navigateToPage(pageID);
        
        // Get page registry metadata for buildDMLData and execDML actions
        // NavigationEfficiency: pageID already set by navigateToPage, fetch without redundant setVals
        const pageRegistryResult = await execEvent('fetchPageByID');
        
        let enhancedConfig = structure;
        if (pageRegistryResult?.data?.[0]) {
          const pageRegistry = pageRegistryResult.data[0];
          enhancedConfig = {
            ...structure,
            props: {
              tableName: pageRegistry.tableName,
              contextKey: pageRegistry.contextKey,
              tableID: pageRegistry.tableID || 'id',
              title: pageRegistry.title || pageRegistry.pageName,
              pageName: pageRegistry.pageName
            }
          };
        }
        
        // Validate page structure integrity
        const validationIssues = validatePageStructure(enhancedConfig);
        if (validationIssues.length > 0) {
          console.warn(`⚠️ Page ${pageID} validation issues:`, validationIssues);
          // Continue anyway but log issues
        }
        
        setPageConfig(enhancedConfig);
      } catch (err) {
        console.error(`❌ Failed to load page structure for pageID ${pageID}:`, err);
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
        // Run health checks first
        console.log('🏥 Running Universal App health checks...');
        const healthResults = await runHealthChecks();
        
        if (healthResults.failed > 0) {
          console.error('🚨 Health checks failed - app may not function properly');
          // Continue anyway but with warnings
        }

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

        // Initialize SessionCache LUOW with user session data
        console.log('💾 Initializing SessionCache with user session data...');
        sessionCache.setSessionData({
          userEmail: sessionData.email,
          userName: sessionData.name || sessionData.userName,
          firstName: sessionData.firstName || sessionData.name?.split(' ')[0],
          lastName: sessionData.lastName || sessionData.name?.split(' ')[1],
          user_id: sessionData.user_id || sessionData.userId,
          account_id: sessionData.account_id || sessionData.accountId,
          role_id: sessionData.role_id || sessionData.roleId
        });
        console.log('✅ SessionCache initialized:', sessionCache.getStats());

        // Set appName in context store ONCE during app initialization
        // This eliminates the need to set it on every page navigation
        console.log('🏷️  Setting appName in context store:', appName);
        await setVals([{ paramName: 'appName', paramVal: appName }]);

        // Initialize page registry cache
        console.log('📚 Loading page registry cache...');
        await initializePageRegistry();
        console.log('✅ Page registry cache loaded');

        console.log('📦 Loading eventTypeConfig at startup...');
        const eventTypes = await fetchEventTypeConfig();
        console.log('✅ Loaded eventTypeConfig:', Object.keys(eventTypes).length, 'types');
        setEventTypeConfig(eventTypes);
        
        console.log('🎉 Universal App startup complete!');
      } catch (err) {
        console.error('❌ Failed to load app config:', err);
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
        
        console.log(`🔍 Looking up pageID for app: ${appName}, page: ${pageName}`);

        // Use cached page registry for instant lookup
        const page = getPageByAppAndName(appName, pageName);
        
        if (!page) {
          throw new Error(`Page not found: ${appName}/${pageName}`);
        }

        console.log(`✅ Found pageID: ${page.pageID} for ${appName}/${pageName} (cached)`);
        setPageID(page.pageID);
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
