import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../../common/Logo/index.jsx';

/**
 * Shared AppBar component for all WhatsFresh applications
 * 
 * @param {Object} props
 * @param {Array} [props.items] - Array of AppBar items to render
 * @param {Function} props.onToggleSidebar - Function to toggle sidebar visibility
 * @param {Function} props.onLogout - Function to handle user logout
 * @param {string} [props.pageTitle] - Current page title to display
 * @param {Object} [props.widgetProps] - Props to pass to widget components
 * @param {Object} [props.sx] - Additional Material-UI sx styling
 */
const AppBar = ({ 
  items = [],
  onToggleSidebar, 
  onLogout,
  pageTitle = "",
  widgetProps = {},
  sx = {}
}) => {
  
  const renderItem = (item, index) => {
    switch (item.type) {
      case 'hamburger':
        return (
          <IconButton 
            key={index}
            edge="start" 
            color="inherit" 
            onClick={onToggleSidebar} 
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
        );
      
      case 'logo':
        return (
          <Box key={index} sx={{ mr: 2 }}>
            <Logo sx={{ width: 32, height: 32 }} />
          </Box>
        );
      
      case 'title':
        return (
          <Typography key={index} variant="h6" sx={{ mr: 2, fontWeight: 'bold' }}>
            {item.content || "WhatsFresh"}
          </Typography>
        );
      
      case 'pageTitle':
        return pageTitle ? (
          <Typography key={index} variant="h6" sx={{ mr: 2, color: 'inherit', opacity: 0.9 }}>
            - {pageTitle}
          </Typography>
        ) : (
          <Typography key={index} variant="body2" sx={{ mr: 2, color: 'inherit', opacity: 0.6, fontStyle: 'italic' }}>
            - Dashboard
          </Typography>
        );
      
      case 'spacer':
        return <Box key={index} sx={{ flexGrow: 1 }} />;
      
      case 'widget':
        if (!item.component) return null;
        const WidgetComponent = item.component;
        const componentProps = {
          ...(item.props || {}),
          ...(widgetProps[item.title] || {}),
          variant: 'appbar' // Indicate this is for AppBar styling
        };
        
        return (
          <Box key={index} sx={{ mr: 2 }}>
            <WidgetComponent {...componentProps} />
          </Box>
        );
      
      case 'logout':
        return onLogout ? (
          <Button 
            key={index}
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            aria-label="logout"
          >
            Logout
          </Button>
        ) : null;
      
      default:
        return null;
    }
  };

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
        {items.map((item, index) => renderItem(item, index))}
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
