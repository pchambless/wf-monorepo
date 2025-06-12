import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

const AppBar = observer(({ onToggleSidebar }) => {
  const location = useLocation();
  
  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    
    const pathSegment = path.split('/').filter(Boolean)[0];
    if (!pathSegment) return 'WhatsFresh';
    
    return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  };
  
  return (
    <MuiAppBar position="static" color="primary" elevation={2}>
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
          WhatsFresh - {getPageTitle()}
        </Typography>
        
        {/* Logout Button */}
        <Button 
          color="inherit" 
          startIcon={<LogoutIcon />}
          onClick={() => console.log("Logging out...")}
        >
          Logout
        </Button>
      </Toolbar>
    </MuiAppBar>
  );
});

export default AppBar;
