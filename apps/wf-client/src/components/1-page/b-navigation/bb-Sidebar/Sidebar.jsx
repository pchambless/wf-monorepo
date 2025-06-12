import React from 'react';
import { Drawer, useMediaQuery, useTheme } from '@mui/material';
import SidebarContent from './SidebarContent';
import createLogger from '@utils/logger';

const log = createLogger('Sidebar.MobX');

const Sidebar = ({ open, onClose }) => {
  log.info('Rendering');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const drawerProps = isMobile
    ? {
        variant: 'temporary',
        anchor: 'left',
        sx: { '& .MuiDrawer-paper': { width: 280 } }
      }
    : {
        variant: 'persistent',
        anchor: 'left',
        sx: { 
          '& .MuiDrawer-paper': { 
            width: 280,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxSizing: 'border-box'
          }
        }
      };
  
  return (
    <Drawer
      open={open}
      onClose={onClose}
      {...drawerProps}
    >
      <SidebarContent onClose={onClose} />
    </Drawer>
  );
};

export default Sidebar;
