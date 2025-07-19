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
import { createLogger, configureLogger, useContextStore } from '@whatsfresh/shared-imports';
import { observer } from 'mobx-react-lite';
// import { disableBrowserFetchLogs } from '@whatsfresh/shared-imports/utils'; // Not available
// Removed ActionHandlerProvider - no longer needed
// import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import theme from './theme';
import { getNavigationSections } from './config/navigation';
import { getAppBarConfig } from './config/appbar';

// Components - JSX imports
import { Modal, useModalStore, MainLayout, LoginForm } from '@whatsfresh/shared-imports/jsx';
import { ErrorBoundary } from '@whatsfresh/shared-imports/jsx';

// Services
import navService from './services/navService';
import { useNavigate } from 'react-router-dom';

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
      appBarConfig={getAppBarConfig()}

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

// Inner component that has access to navigate
const AppContent = observer(() => {
  const [accountData, setAccountData] = useState(null);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const contextStore = useContextStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize navService with navigate function
    navService.init(navigate);

    // Filter out noisy browser fetch logs
    // disableBrowserFetchLogs(); // Not available
    log.debug('App component mounted');

    // Don't auto-validate sessions - require explicit login
    // The sessionValid flag will only be set after successful login
    setIsSessionRestored(true);

    log.debug('Session restoration completed', {
      isAuthenticated: contextStore.isAuthenticated,
      userID: contextStore.getParameter('userID'),
      sessionValid: contextStore.getParameter('sessionValid')
    });
  }, [contextStore, navigate]);

  const handleAccountDataReady = React.useCallback((data) => {
    setAccountData(data);
  }, []);

  // Navigation function for login form
  const navigateToApp = React.useCallback(() => {
    navService.navigate('/dashboard', { replace: true });
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

  // Show loading while session is being restored
  if (!isSessionRestored) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>

        {/* Temporarily comment out BreadcrumbProvider */}
        {/* <BreadcrumbProvider> */}
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={
            contextStore.isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout title="Sign In">
                <LoginForm routes={ROUTES} navigateToApp={navigateToApp} />
              </AuthLayout>
            )
          } />

          {/* Dashboard route */}
          <Route path="/dashboard" element={
            contextStore.isAuthenticated ? (
              <MainLayout
                navigationSections={getNavigationSections()}

                appBarConfig={getAppBarConfig()}
                appName="WhatsFresh Client"
                onLogout={() => navService.logout()}
                widgetProps={widgetProps}
              >
                <DashboardWrapper
                  onAccountDataReady={handleAccountDataReady}
                  widgetProps={widgetProps}
                />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Special non-registry routes */}
          <Route path="/" element={
            <Navigate to={contextStore.isAuthenticated ? "/dashboard" : "/login"} replace />
          } />

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

            // Create route with MainLayout for all pages
            return (
              <Route
                key={config.routeKey}
                path={routeInfo.path}
                element={
                  contextStore.isAuthenticated ? (
                    <MainLayout
                      navigationSections={getNavigationSections()}
                      appBarConfig={getAppBarConfig()}

                      appName="WhatsFresh Client"
                      onLogout={() => navService.logout()}
                      widgetProps={widgetProps}
                    >
                      <Suspense fallback={<CircularProgress />}>
                        <PageComponent />
                      </Suspense>
                    </MainLayout>
                  ) : (
                    <Navigate to="/login" replace />
                  )
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
  );
});

// Outer App component that provides Router context
const App = () => {
  return (
    <Router>
      <AppContent />
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
