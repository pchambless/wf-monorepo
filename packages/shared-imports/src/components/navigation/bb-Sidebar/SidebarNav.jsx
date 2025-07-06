import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import navService from '@services/navService';
import * as MuiIcons from '@mui/icons-material';

// Add the missing getIcon function
const getIcon = (iconName) => {
  if (!iconName) return null;
  
  // Try to get the icon component using the standard naming convention
  const IconComponent = MuiIcons[`${iconName}Icon`];
  
  // If found, return the component
  if (IconComponent) {
    return <IconComponent />;
  }
  
  // Fallback for debugging
  return <span style={{fontSize: '10px'}}>{iconName}</span>;
};

const SidebarNav = ({ sections, onClose }) => {
  // Only show top-level sections in sidebar
  return (
    <List>
      {sections?.map((section) => (
        <ListItem key={section.id} disablePadding>
          <ListItemButton 
            onClick={() => {
              // Navigate to default route for this section
              if (section.defaultRoute) {
                navService.byRouteKey(section.defaultRoute);
              } else if (section.items?.[0]?.listEvent) {
                navService.byListEvent(section.items[0].listEvent);
              }
              onClose();
            }}
          >
            <ListItemIcon>{getIcon(section.icon)}</ListItemIcon>
            <ListItemText primary={section.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SidebarNav;
