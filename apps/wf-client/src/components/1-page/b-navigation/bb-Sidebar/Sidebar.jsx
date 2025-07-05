import React from 'react';
import { Box, Drawer, Toolbar } from '@mui/material';
import SidebarContent from './SidebarContent';
import { getNavigationSections } from '@config/navigation';
import { getRouteKeyByEvent } from '@config/routes';
import { accountStore, createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('Sidebar');

const Sidebar = ({ width, open, mobileOpen, handleDrawerToggle, onClose }) => {
  const accountId = accountStore.currentAccountId;

  // Get navigation sections from app config
  const sections = getNavigationSections();

  // Process sections to resolve route parameters
  const processedSections = React.useMemo(() => {
    log.info(`sections: `, sections, `accountId: `, accountId);
    if (!sections) return [];

    return sections.map(section => ({
      ...section,
      items: section.items ? section.items.map(item => {
        // Get route key from eventType
        const routeKey = getRouteKeyByEvent(item.eventType);
        // For now, use simple paths until we implement account-based routing
        const path = routeKey ? `/${item.eventType}` : '#';
        return { ...item, path };
      }) : [],
      // Handle top-level sections without items
      path: section.eventType ? `/${section.eventType}` : undefined
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
