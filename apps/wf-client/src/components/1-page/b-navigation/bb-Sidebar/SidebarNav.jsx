import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import navService from '@services/navService';
// import * as MuiIcons from '@mui/icons-material';

// Simplified icon function that avoids React component object issues
const getIcon = (iconName) => {
  // Return a simple text placeholder instead of trying to render Material-UI icons
  if (!iconName) return '📁'; // Default folder icon

  // Simple emoji/text mappings for common icons
  const iconMap = {
    'Kitchen': '🍽️',
    'Inventory': '📦',
    'Settings': '⚙️',
    'Map': '🗺️',
    'List': '📋',
    'Category': '📂',
    'Product': '🏷️',
    'Ingredient': '🥄'
  };

  return iconMap[iconName] || '📄'; // Default document icon
};

const SidebarNav = ({ sections, onClose }) => {
  // Only show top-level sections in sidebar
  return (
    <List>
      {sections?.map((section, index) => (
        <ListItem key={section.id || section.title || `section-${index}`} disablePadding>
          <ListItemButton
            onClick={() => {
              // Navigate to default route for this section
              if (section.defaultRoute) {
                navService.byRouteKey(section.defaultRoute);
              } else if (section.items?.[0]?.listEvent) {
                navService.byListEvent(section.items[0].listEvent);
              }
              if (onClose) onClose();
            }}
          >
            <ListItemIcon>
              <span style={{ fontSize: '20px' }}>
                {getIcon(section.icon?.name || section.title)}
              </span>
            </ListItemIcon>
            <ListItemText primary={section.title || 'Unnamed Section'} />
          </ListItemButton>
        </ListItem>
      )) || []}
    </List>
  );
};

export default SidebarNav;
