import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import navService from '@services/navService'; // Relative path

const AppBar = ({ onToggleSidebar }) => {
  const handleLogout = () => {
    navService.logout();
  };
  
  return (
    <MuiAppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: 64
      }}
    >
      <Toolbar>
        {/* Hamburger Menu */}
        <IconButton 
          edge="start" 
          color="inherit" 
          onClick={onToggleSidebar} 
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* App Name */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          WhatsFresh - Dashboard
        </Typography>
        
        {/* Logout Button */}
        <Button 
          color="inherit" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
