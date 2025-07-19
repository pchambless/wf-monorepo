import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  Toolbar, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Divider,
  Typography
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getEventType } from '@whatsfresh/shared-imports/events';
import { execEvent, contextStore, createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('Sidebar');

/**
 * Shared Sidebar component for all WhatsFresh applications
 * 
 * @param {Object} props
 * @param {Array} props.navigationSections - Array of navigation sections with items
 * @param {number} [props.width=240] - Sidebar width in pixels
 * @param {boolean} props.open - Whether sidebar is open on desktop
 * @param {boolean} props.mobileOpen - Whether sidebar is open on mobile
 * @param {Function} props.onDrawerToggle - Function to toggle mobile drawer
 * @param {Function} [props.onNavClick] - Function called when navigation item is clicked
 * @param {string} [props.appTitle] - Application title for header
 * @param {React.ReactNode} [props.logo] - Logo component to display
 * @param {Object} [props.widgetProps] - Props to pass to widget components
 * @param {Object} [props.sx] - Additional Material-UI sx styling
 */
const Sidebar = ({ 
  navigationSections = [],
  width = 240,
  open,
  mobileOpen,
  onDrawerToggle,
  onNavClick,
  appTitle = "WhatsFresh",
  widgetProps = {},
  logo,
  sx = {}
}) => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  // Handle navigation item click
  const handleNavClick = (item, section) => {
    console.log('🔍 Navigation clicked:', { item, eventType: item.eventType });
    
    if (item.eventType) {
      const event = getEventType(item.eventType);
      console.log('🔍 Found event:', event);
      
      if (event && event.routePath) {
        // Get current account ID from widget props
        const currentAcctID = widgetProps?.Account?.value;
        console.log('🔍 Current account ID:', currentAcctID);
        console.log('🔍 Event params:', event.params);
        
        if (event.params && event.params.includes(':acctID')) {
          // Route requires account ID
          if (currentAcctID) {
            const path = event.routePath.replace(':acctID', currentAcctID);
            console.log('🔍 Navigating to resolved path:', path);
            console.log('🔍 About to call navigate() with path:', path);
            navigate(path);
            console.log('🔍 navigate() call completed');
            
            // Check if navigation was successful after a short delay
            setTimeout(() => {
              console.log('🔍 Current URL after navigation attempt:', window.location.href);
            }, 100);
          } else {
            console.warn(`No account selected for navigation to ${item.eventType}`);
          }
        } else {
          // Route has no parameters or doesn't need account ID
          console.log('🔍 Navigating to direct route:', event.routePath);
          navigate(event.routePath);
        }
      } else {
        // Fallback to simple eventType-based navigation
        console.log('🔍 Fallback navigation to:', `/${item.eventType}`);
        navigate(`/${item.eventType}`);
      }
    }
    
    // Call optional callback
    onNavClick?.(item, section);
    
    // Close mobile drawer on navigation
    if (mobileOpen && onDrawerToggle) {
      onDrawerToggle();
    }
  };

  // Handle section collapse toggle
  const handleSectionToggle = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Render navigation items
  const renderNavItems = (items, isNested = false) => {
    return items.map((item, index) => (
      <ListItem key={index} disablePadding sx={{ pl: isNested ? 4 : 2 }}>
        <ListItemButton onClick={() => handleNavClick(item)}>
          {item.icon && (
            <ListItemIcon sx={{ minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
          )}
          <ListItemText 
            primary={item.title} 
            secondary={item.description}
            primaryTypographyProps={{ 
              variant: isNested ? 'body2' : 'body1',
              fontWeight: isNested ? 'normal' : 'medium'
            }}
          />
        </ListItemButton>
      </ListItem>
    ));
  };

  // Create selection change handler for widgets
  const createSelectionChangeHandler = (section) => {
    if (!section.onSelectionChange) return null;
    
    return async (value, selectedItem) => {
      try {
        log.debug('Widget selection changed:', { 
          widget: section.title, 
          value, 
          onSelectionChange: section.onSelectionChange 
        });
        
        // Parse and execute the onSelectionChange commands
        const commands = section.onSelectionChange.split(';').map(cmd => cmd.trim());
        
        for (const command of commands) {
          if (command.startsWith('setParameter(')) {
            // Handle setParameter calls - replace 'value' with actual value
            const paramCall = command.replace(/setParameter\('([^']+)',\s*value\)/, `setParameter('$1', ${value})`);
            const match = paramCall.match(/setParameter\('([^']+)',\s*(\d+)\)/);
            if (match) {
              const [, paramName, paramValue] = match;
              contextStore.setParameter(paramName, parseInt(paramValue));
              log.debug('Set parameter:', { paramName, paramValue });
            }
          } else if (command.startsWith('navigateTo(')) {
            // Handle navigateTo calls
            const match = command.match(/navigateTo\('([^']+)'\)/);
            if (match) {
              const eventType = match[1];
              const event = getEventType(eventType);
              if (event?.routePath) {
                // Build route with contextStore parameters
                let route = event.routePath;
                if (event.params) {
                  event.params.forEach(param => {
                    const paramName = param.replace(':', '');
                    const paramValue = contextStore.getParameter(paramName);
                    if (paramValue) {
                      route = route.replace(param, paramValue);
                    }
                  });
                }
                navigate(route);
                log.debug('Navigated to:', { eventType, route });
              } else {
                navigate(`/${eventType}`);
                log.debug('Fallback navigation to:', eventType);
              }
            }
          } else if (command.startsWith('execEvent(')) {
            // Handle execEvent calls
            const match = command.match(/execEvent\('([^']+)'\)/);
            if (match) {
              const eventType = match[1];
              await execEvent(eventType);
              log.debug('Executed event:', eventType);
            }
          }
        }
      } catch (error) {
        log.error('Error in selection change handler:', error);
      }
    };
  };

  // Render navigation sections
  const renderNavSections = () => {
    return navigationSections.map((section, index) => {
      const isExpanded = expandedSections[section.title] !== false; // Default to expanded
      const hasItems = section.items && section.items.length > 0;

      return (
        <React.Fragment key={index}>
          {section.type === 'header' ? (
            // Header section - compact visual divider
            <Box sx={{ 
              mt: index > 0 ? 1.5 : 0, 
              mb: 0.5, 
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 0.5
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                {section.title}
              </Typography>
            </Box>
          ) : section.type === 'widget' && section.component ? (
            // Widget section - render the React component
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Box sx={{ width: '100%', px: 2, py: 1 }}>
                <section.component 
                  {...(section.props || {})} 
                  {...(widgetProps[section.title] || {})}
                  onChange={(value, item) => {
                    console.log('🔍 Sidebar onChange called:', { value, item, section: section.title });
                    const handler = createSelectionChangeHandler(section);
                    if (handler) handler(value, item);
                  }}
                />
              </Box>
            </ListItem>
          ) : section.collapsible && hasItems ? (
            // Collapsible section header
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSectionToggle(section.title)}>
                {section.icon && (
                  <ListItemIcon>
                    <section.icon />
                  </ListItemIcon>
                )}
                <ListItemText 
                  primary={section.title}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
          ) : (
            // Direct navigation item (no subitems)
            !hasItems && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick(section)}>
                  {section.icon && (
                    <ListItemIcon>
                      <section.icon />
                    </ListItemIcon>
                  )}
                  <ListItemText 
                    primary={section.title}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItemButton>
              </ListItem>
            )
          )}

          {/* Render subitems */}
          {hasItems && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(section.items, true)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header - Logo only, no redundant title */}
      {logo && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 1 }}>
            {logo}
          </Box>
        </Box>
      )}
      
      <Divider />
      
      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {renderNavSections()}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: width }, 
        flexShrink: { sm: 0 },
        ...sx 
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: width },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {sidebarContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: width },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
