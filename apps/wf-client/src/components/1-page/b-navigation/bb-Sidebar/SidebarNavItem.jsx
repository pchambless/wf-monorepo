import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // No need for useLocation
import { 
  ListItem, ListItemIcon, ListItemText, Collapse, 
  List, Box
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import * as MuiIcons from '@mui/icons-material';
import { useNav } from '@nav/useNav'; // Import the custom hook for navigation

const SidebarNavItem = ({ item, onClose }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { isActive } = useNav(); // Get isActive from hook
  
  const hasChildren = item.children && item.children.length > 0;
  // Use the isActive helper instead of direct path comparison
  const active = isActive(item.path);
  
  // Get the right icon component
  const Icon = item.icon ? MuiIcons[item.icon] || MuiIcons.Circle : MuiIcons.Circle;
  
  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      navigate(item.path);
      if (onClose) onClose(); // Close sidebar on mobile
    }
  };
  
  return (
    <>
      <ListItem 
        button 
        onClick={handleClick}
        selected={active}
      >
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={item.title} />
        {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItem>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box pl={4}>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <SidebarNavItem 
                  key={child.title}
                  item={child}
                  onClose={onClose}
                />
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </>
  );
};

export default SidebarNavItem;
