import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Divider } from '@mui/material'; // Removed Typography, List, ListItem
// Removed the Link import as well
import SidebarHeader from './SidebarHeader';
import AccountSelector from './components/AccountSelector';
import SidebarNav from './SidebarNav';
import createLogger from '@utils/logger';

const log = createLogger('SidebarContent.MobX');

const SidebarContent = observer(({ sections, onNavItemClick }) => {
  log.debug('Rendering MobX SidebarContent');
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo and app name */}
      <SidebarHeader />
      
      <Divider />
      
      {/* Account Selector */}
      <AccountSelector onClose={onNavItemClick} />
      
      <Divider sx={{ my: 1 }} />
      
      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
        {/* Pass the processed sections to SidebarNav */}
        <SidebarNav sections={sections} onClose={onNavItemClick} />
        
        
      </Box>
    </Box>
  );
});

export default SidebarContent;
