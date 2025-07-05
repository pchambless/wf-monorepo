import React, { Suspense, useState, useEffect } from 'react';
import { Box, CircularProgress, CssBaseline, Toolbar } from '@mui/material';
// Temporary: Use local navigation until JSX parsing is fixed
import AppBar from '@navigation/aa-AppBar/AppBar';
import Sidebar from '@navigation/bb-Sidebar';
import { getNavigationSections } from '@config/navigation';
import navService from '@services/navService';
import { useAccountStore } from '@stores/accountStore';
import { execEvent, createLogger } from '@whatsfresh/shared-imports';

const SIDEBAR_WIDTH = 240;
const log = createLogger('MainLayout');

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountStore = useAccountStore();

  // Initialize account data when layout loads (user is authenticated)
  useEffect(() => {
    const initializeAccountData = async () => {
      // Only initialize if we have a user but no account data
      if (accountStore.isAuthenticated &&
        accountStore.currentUser &&
        (!accountStore.userAcctList || accountStore.userAcctList.length === 0)) {

        try {
          log.info('Initializing account data for authenticated user:', accountStore.currentUser.userID);

          // Load user accounts
          const accounts = await execEvent('userAcctList', {
            ':userID': accountStore.currentUser.userID
          });

          log.info('Accounts loaded in MainLayout:', { count: accounts?.length, accounts });

          // Update the account store with the accounts (user data is already there)
          accountStore.setUserLoginData(accountStore.currentUser, accounts);

          log.info('Account store updated:', {
            currentAcctID: accountStore.currentAcctID,
            accountCount: accountStore.userAcctList?.length
          });

        } catch (error) {
          log.error('Failed to initialize account data:', error);
        }
      }
    };

    initializeAccountData();
  }, [accountStore.isAuthenticated, accountStore.currentUser]); // Re-run if auth state changes

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    navService.logout();
  };

  // Get navigation sections from app config
  const navigationSections = getNavigationSections();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />

      {/* Local AppBar component (temporary) */}
      <AppBar
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Local Sidebar component (temporary) */}
      <Sidebar
        width={SIDEBAR_WIDTH}
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
          mt: 8, // Margin top for AppBar
          transition: 'width 0.3s ease'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Suspense fallback={<CircularProgress />}>
          {children}
        </Suspense>
      </Box>
    </Box>
  );
};

export default MainLayout;
