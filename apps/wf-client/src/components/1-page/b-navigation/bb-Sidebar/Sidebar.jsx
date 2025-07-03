import React from 'react';
import { Box, Drawer, Toolbar } from '@mui/material';
import SidebarContent from './SidebarContent';
import { resolveRoute, getRouteKeyByEvent } from '@whatsfresh/shared-config';
import { getNavSections } from '../../../../navigation/sidebar';
import { useAccountStore } from '@stores/accountStore';
import createLogger from '@whatsfresh/shared-imports';

const log = createLogger('Sidebar');

const Sidebar = ({ width, open, mobileOpen, handleDrawerToggle, onClose }) => {
  const accountStore = useAccountStore();
  const accountId = accountStore.currentAcctID;
  
  // Generate navigation sections
  const sections = getNavSections();
  
  // Process sections to resolve route parameters
  const processedSections = React.useMemo(() => {
    log.info(`sections: `, sections, `accountId: `, accountId);
    if (!sections || !accountId) return sections || [];
    
    return sections.map(section => ({
      ...section,
      items: section.items.map(item => {
        // Get route key from eventType
        const routeKey = getRouteKeyByEvent(item.eventType);
        const path = routeKey ? resolveRoute(routeKey, { acctID: String(accountId) }) : '#';
        return { ...item, path };
      })
    }));
  }, [sections, accountId]);

  // Sidebar content to reuse
  const sidebarContent = (
    <SidebarContent 
      sections={processedSections} 
      onNavItemClick={onClose} 
    />
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: width }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
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
