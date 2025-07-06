import React, { Suspense, useState } from 'react';
import { Box, CircularProgress, CssBaseline, Toolbar } from '@mui/material';
import AppBar from '../1-page/b-navigation/aa-AppBar/AppBar.jsx';
import Sidebar from '../1-page/b-navigation/bb-Sidebar/Sidebar.jsx';
import Logo from '../Logo/index.js';

/**
 * Shared MainLayout component for all WhatsFresh applications
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {Array} props.navigationSections - App-specific navigation configuration
 * @param {string} [props.appName] - Application name for AppBar
 * @param {Function} props.onLogout - Logout handler
 * @param {number} [props.sidebarWidth=240] - Sidebar width in pixels
 * @param {Object} [props.sx] - Additional styling
 */
const MainLayout = ({
  children,
  navigationSections = [],
  appName = "WhatsFresh",
  onLogout,
  sidebarWidth = 240,
  sx = {}
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', ...sx }}>
      <CssBaseline />

      {/* Shared AppBar component */}
      <AppBar
        appName={appName}
        onToggleSidebar={handleToggleSidebar}
        onLogout={onLogout}
      />

      {/* Shared Sidebar component */}
      <Sidebar
        navigationSections={navigationSections}
        width={sidebarWidth}
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        appTitle={appName}
        logo={<Logo />}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
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