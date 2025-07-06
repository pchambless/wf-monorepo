import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * Shared AppBar component for all WhatsFresh applications
 * 
 * @param {Object} props
 * @param {string} props.appName - Application name to display in header
 * @param {Function} props.onToggleSidebar - Function to toggle sidebar visibility
 * @param {Function} props.onLogout - Function to handle user logout
 * @param {boolean} [props.showMenuButton=true] - Whether to show hamburger menu button
 * @param {boolean} [props.showLogout=true] - Whether to show logout button
 * @param {Object} [props.sx] - Additional Material-UI sx styling
 */
const AppBar = ({ 
  appName = "WhatsFresh", 
  onToggleSidebar, 
  onLogout,
  showMenuButton = true,
  showLogout = true,
  sx = {}
}) => {
  return (
    <MuiAppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: 64,
        ...sx
      }}
    >
      <Toolbar>
        {/* Hamburger Menu */}
        {showMenuButton && (
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={onToggleSidebar} 
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* App Name */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {appName}
        </Typography>
        
        {/* Logout Button */}
        {showLogout && onLogout && (
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            aria-label="logout"
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
