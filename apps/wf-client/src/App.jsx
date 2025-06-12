import React, { useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate  // Add this import
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box, Typography } from '@mui/material';

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

// Layouts and pages
import MainLayout from 'layouts/MainLayout';
import LoginLayout from '@layout/AuthLayout';
import Login from '@pages/0-Auth/01-Login';
import Dashboard from '@pages/1-Dashboard';
// import ForgotPassword from '@pages/2-ForgotPassword'; // Import ForgotPassword

// Add this import at the top
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

// REMOVE THIS DUPLICATE IMPORT
// import Modal from './components/Modal'; 

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
                <Route path="/login" element={
                  <LoginLayout title="Sign In">
                    <Login />
                  </LoginLayout>
                } />
                
                                
                {/* Protected app routes */}
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Other protected routes */}
                </Route>
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
