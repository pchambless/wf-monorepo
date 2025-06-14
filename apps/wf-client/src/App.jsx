import React, { Suspense, lazy, useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box, Typography } from '@mui/material';
import { ROUTES } from '@whatsfresh/shared-config/src/routes'; // Move this up here
import { entityRegistry } from '@whatsfresh/shared-config/pageMapRegistry';

// Utilities and contexts
import createLogger, { configureLogger } from './utils/logger';
import { disableBrowserFetchLogs } from './utils/fetchLogHelper';
import { ActionHandlerProvider } from './actions/ActionHandlerContext';
// import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import theme from './theme';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import { Modal, useModalStore } from '@modal'; // Keep only this Modal import

// Services
import { initEventTypeService } from './stores/eventStore';
import { useAccountStore } from '@stores/accountStore';
import navService from './services/navService';

// Base layouts
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

// Always import these core components
const Dashboard = lazy(() => import('./pages/1-Dashboard'));
const Login = lazy(() => import('./pages/0-Auth/01-Login'));

// Map of lazy-loaded components
const lazyPages = new Map();

// Function to get a lazy-loaded component if ready
const getLazyComponent = (config) => {
  if (!config || !config.pageIndexPath || !config.import) return null;
  
  const cacheKey = config.pageIndexPath;
  
  // Return from cache if already created
  if (lazyPages.has(cacheKey)) {
    return lazyPages.get(cacheKey);
  }
  
  // Define a mapping of known paths to imports
  // This makes webpack happy because it can see all possible imports
  try {
    let component;
    
    // Replace with a switch statement based on pageIndexPath
    switch (config.pageIndexPath) {
      case "2-Ingredient/01-ingrTypeList/index.jsx":
        component = lazy(() => import('./pages/2-Ingredient/01-ingrTypeList'));
        break;
      case "3-Product/01-prodTypeList/index.jsx":
        component = lazy(() => import('./pages/3-Product/01-prodTypeList'));
        break;
      // Add other cases as needed
      default:
        console.warn(`No static import mapping for: ${config.pageIndexPath}`);
        return null;
    }
    
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
const App = () => {
  const [eventTypesLoaded, setEventTypesLoaded] = useState(false);
  
  useEffect(() => {
    // Filter out noisy browser fetch logs
    disableBrowserFetchLogs();
    log.debug('App component mounted');
    
    // Initialize event types synchronously from the shared package
    try {
      initEventTypeService();
      log.info('Event types loaded successfully at startup');
      setEventTypesLoaded(true);
    } catch (error) {
      log.error('Failed to load event types at startup:', error);
      setEventTypesLoaded(false);
    }
  }, []);
  
  console.log('App: Rendering');
  
  // Show loading screen until event types are loaded
  if (!eventTypesLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography variant="h6">Loading application data...</Typography>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          {/* Add the initializer right after Router */}
          <NavServiceInitializer />
          
          <ActionHandlerProvider options={{ executeHandlers: true, logOnly: false }}>
            {/* Temporarily comment out BreadcrumbProvider */}
            {/* <BreadcrumbProvider> */}
              <Routes>
                {/* Auth routes */}
                <Route path={ROUTES.LOGIN.path} element={
                  <AuthLayout title="Sign In">
                    <Login />
                  </AuthLayout>
                } />
                
                {/* Special non-registry routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Generated routes from registry */}
                {Object.entries(entityRegistry).map(([eventName, config]) => {
                  // Skip if not ready to import
                  if (!config.import || !config.routeKey) return null;
                  
                  const routeInfo = ROUTES[config.routeKey];
                  if (!routeInfo) return null;
                  
                  // Try to get component
                  const PageComponent = getLazyComponent(config);
                  if (!PageComponent) {
                    console.log(`Skipping route ${config.routeKey} - component not available`);
                    return null;
                  }
                  
                  // Create route with proper layout
                  return (
                    <Route 
                      key={config.routeKey}
                      path={routeInfo.path}
                      element={
                        <Suspense fallback={<CircularProgress />}>
                          <MainLayout>
                            <PageComponent />
                          </MainLayout>
                        </Suspense>
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
          </ActionHandlerProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Router>
  );
};

const ModalContainer = () => {
  // Use modal store to get modal state
  const { isOpen, config, closeModal } = useModalStore();
  
  // Add safety check for undefined onRowClick
  const handleRowClick = config?.onRowClick || (() => {});
  
  // Build modal props
  const modalProps = {
    isOpen,  // Fix: simplified property assignment
    onRequestClose: closeModal,
    content: isOpen ? {
      type: config?.type || 'message',
      title: config?.title || '',
      message: config?.message || '',
      ...config
    } : null,
    onRowClick: handleRowClick
  };
  
  // Return modal component
  return <Modal {...modalProps} />;
};

// Add a ProtectedRoute component for authentication check
const ProtectedRoute = ({ children }) => {
  const accountStore = useAccountStore();
  
  // Check if store itself is null or undefined first
  if (!accountStore) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Initializing account...</Typography>
      </Box>
    );
  }
  
  // Now we can safely destructure properties
  const { isAuthenticated, isLoading } = accountStore;
  
  // Show loading if checking auth status
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN.path} replace />;
  }
  
  // If authenticated, render children
  return children;
};

// Add this component inside App.jsx
const NavServiceInitializer = () => {
  const navigate = useNavigate();
  
  // Initialize navigation service when component mounts
  useEffect(() => {
    navService.init(navigate);
    log.debug('Navigation service initialized');
  }, [navigate]);
  
  return null; // This component doesn't render anything
};

export default App;
