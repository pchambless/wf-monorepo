import React, { Suspense, useState } from 'react';
import { Box, CircularProgress, CssBaseline, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '@navigation/bb-Sidebar';
import AppBar from '@navigation/aa-AppBar/AppBar';

const SIDEBAR_WIDTH = 240;

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Use your custom AppBar component */}
      <AppBar 
        onToggleSidebar={handleToggleSidebar} 
      />

      {/* Use Sidebar component for both mobile/desktop */}
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
          width: { sm: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          mt: 8, // Add margin top to account for AppBar
          transition: 'width 0.3s ease'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Suspense fallback={<CircularProgress />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
};

export default MainLayout;
