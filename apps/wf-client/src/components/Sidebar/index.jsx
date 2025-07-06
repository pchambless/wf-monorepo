import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    Toolbar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';

const SIDEBAR_WIDTH = 240;

const Sidebar = ({
    open,
    navigationSections = [],
    mobileOpen = false,
    onClose,
    onNavigation
}) => {
    // Render navigation items recursively
    const renderNavItems = (items, isNested = false) => {
        return items.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ pl: isNested ? 4 : 2 }}>
                <ListItemButton onClick={() => onNavigation?.(item.path || '#')}>
                    {item.icon && (
                        <ListItemIcon>
                            {item.icon === 'dashboard' ? <DashboardIcon /> :
                                item.icon === 'receipt' ? <ReceiptIcon /> :
                                    <InventoryIcon />}
                        </ListItemIcon>
                    )}
                    <ListItemText primary={item.label} />
                </ListItemButton>

                {item.children && item.children.length > 0 && (
                    <List>
                        {renderNavItems(item.children, true)}
                    </List>
                )}
            </ListItem>
        ));
    };

    const drawer = (
        <Box>
            <Toolbar /> {/* Spacer to align below AppBar */}
            <Divider />

            {navigationSections.map((section, index) => (
                <Box key={index}>
                    {index > 0 && <Divider />}
                    <List>
                        {renderNavItems(section.items)}
                    </List>
                </Box>
            ))}
        </Box>
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? SIDEBAR_WIDTH : 70,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: open ? SIDEBAR_WIDTH : 70,
                    boxSizing: 'border-box',
                    transition: (theme) => theme.transitions.create(['width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden'
                },
            }}
            open={open}
        >
            {drawer}
        </Drawer>
    );
};

export default Sidebar;
