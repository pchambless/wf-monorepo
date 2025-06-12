import React, { Suspense, useState, useEffect } from 'react';
import { Box, CircularProgress, AppBar, Toolbar, Typography, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import Sidebar from '@navigation/bb-Sidebar';
import { navigationConfig } from '@config/navigationConfig';

const SIDEBAR_WIDTH = 240;

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Debug the sidebar toggle
  useEffect(() => {
    console.log("Sidebar state:", sidebarOpen);
    console.log("Navigation config:", navigationConfig);
  }, [sidebarOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar with toggle function */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            WhatsFresh
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
        open
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </Drawer>

      {/* Main content area with sidebar */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', mt: 8 }}>
        {/* Main content with margin adjustment */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          overflow: 'auto',
          width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
          transition: 'width 0.3s ease'
        }}>
          <Suspense fallback={<CircularProgress />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
