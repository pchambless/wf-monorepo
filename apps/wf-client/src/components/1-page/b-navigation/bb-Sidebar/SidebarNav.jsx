import React from 'react';
import { List } from '@mui/material';
import SidebarNavItem from './SidebarNavItem';

import { useNav } from '@nav/useNav';

const SidebarNav = ({ onClose }) => {
  const { navigation } = useNav();
  
  return (
    <List>
      {navigation.map((item) => (
        <SidebarNavItem 
          key={item.title}
          item={item}
          onClose={onClose}
        />
      ))}
    </List>
  );
};

export default SidebarNav;
