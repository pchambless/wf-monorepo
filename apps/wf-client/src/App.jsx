import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress } from '@mui/material';
import { ROUTES, entityRegistry } from './config/routes.js';

// Utilities and contexts from shared-imports
import { createLogger, configureLogger } from '@whatsfresh/shared-imports';
// import { disableBrowserFetchLogs } from '@whatsfresh/shared-imports/utils'; // Not available
// Removed ActionHandlerProvider - no longer needed
// import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import theme from './theme';
import { getNavigationSections } from './config/navigation';

// Components - JSX imports
import { Modal, useModalStore, MainLayout, LoginForm } from '@whatsfresh/shared-imports/jsx';
import { ErrorBoundary } from '@whatsfresh/shared-imports/jsx';

// Services
import navService from './services/navService';

// Local layouts and pages (temporary until shared AuthLayout works)
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

// Local pages only
const Dashboard = lazy(() => import('./pages/dashboard'));

// LoginForm now uses shared navigation utilities with app routes

// Map of lazy-loaded components
const lazyPages = new Map();

// Function to get a lazy-loaded component if ready
const getLazyComponent = (config) => {
  if (!config || !config.eventType) return null;

  const cacheKey = config.eventType;

  // Return from cache if already created
  if (lazyPages.has(cacheKey)) {
    return lazyPages.get(cacheKey);
  }

  // Define a mapping of known paths to imports
  // This makes webpack happy because it can see all possible imports
  try {
    let component;

    // Direct eventType → folder mapping (simplified architecture)
    // Use the eventType as the folder name directly
    const eventType = config.eventType;

    // Direct mapping: eventType === folder name
    component = lazy(() => import(`./pages/${eventType}/index.jsx`));

    lazyPages.set(cacheKey, component);
    return component;
  } catch (error) {
    console.error(`Failed to load component: ${config.pageIndexPath}`, error);
    return null;
  }
};

const log = createLogger('App');
console.log('App.js is being executed');

// Configure logger at application startup
configureLogger({
  showTimestamps: true,
  dedupeTimeWindow: 500
});

// Log at the top-level App mounting
// Dashboard wrapper component 
const DashboardWrapper = ({ onAccountDataReady, widgetProps }) => {
  return (
    <MainLayout
      navigationSections={getNavigationSections()}
      appName="WhatsFresh Client"
      onLogout={() => navService.logout()}
      widgetProps={widgetProps}
    >
      <Suspense fallback={<CircularProgress />}>
        <Dashboard onAccountDataReady={onAccountDataReady} />
      </Suspense>
    </MainLayout>
  );
};

const App = () => {
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    // Filter out noisy browser fetch logs
    // disableBrowserFetchLogs(); // Not available
    log.debug('App component mounted');
  }, []);

  const handleAccountDataReady = React.useCallback((data) => {
    setAccountData(data);
  }, []);

  // Create widget props for the account selector - memoized to prevent infinite re-renders
  const widgetProps = React.useMemo(() => {
    if (!accountData) return {};

    return {
      Account: {
        data: accountData.userAcctList,
        value: accountData.currentAcctID,
        onChange: (selectedId) => {
          accountData.handleAccountChange(selectedId);
        },
        disabled: accountData.loading,
        loading: accountData.loading
      }
    };
  }, [
    accountData]);


  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>

          {/* Temporarily comment out BreadcrumbProvider */}
          {/* <BreadcrumbProvider> */}
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={
              <AuthLayout title="Sign In">
                <LoginForm routes={ROUTES} />
              </AuthLayout>
            } />

            {/* Dashboard route */}
            <Route path="/dashboard" element={
              <DashboardWrapper
                onAccountDataReady={handleAccountDataReady}
                widgetProps={widgetProps}
              />
            } />

            {/* Special non-registry routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Generated routes from registry */}
            {Object.entries(entityRegistry).map(([_eventName, config]) => {
              // Skip if not ready to import
              if (!config.import || !config.routeKey) {
                return null;
              }

              const routeInfo = ROUTES[config.routeKey];
              if (!routeInfo) {
                return null;
              }

              // Try to get component
              const PageComponent = getLazyComponent(config);
              if (!PageComponent) {
                return null;
              }

              // Create route with proper layout
              return (
                <Route
                  key={config.routeKey}
                  path={routeInfo.path}
                  element={
                    <MainLayout
                      navigationSections={getNavigationSections()}
                      appName="WhatsFresh Client"
                      onLogout={() => navService.logout()}
                      widgetProps={widgetProps}
                    >
                      <Suspense fallback={<CircularProgress />}>
                        <PageComponent />
                      </Suspense>
                    </MainLayout>
                  }
                />
              );
            })}


            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* IMPORTANT: Modal must be at root level */}
          <ModalContainer />
          {/* </BreadcrumbProvider> */}
          {/* Removed ActionHandlerProvider */}
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  );
};

const ModalContainer = () => {
  // Use modal store to get modal state
  const { isOpen, config, closeModal } = useModalStore();

  return (
    <Modal
      isOpen={isOpen}
      config={config}
      onClose={closeModal}
    />
  );
};

export default App;
