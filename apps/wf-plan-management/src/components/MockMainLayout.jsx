import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CssBaseline,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  FilterList,
  Chat,
  Timeline,
  Add,
  Assessment,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const iconMap = {
  Dashboard,
  Assignment,
  FilterList,
  Chat,
  Timeline,
  Add,
  Assessment,
};

const MockMainLayout = ({
  children,
  navigationSections,
  appBarConfig,
  appName,
}) => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({
    0: true, // Open first section by default
    1: true, // Open second section by default
  });

  const handleSectionToggle = (sectionIndex) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {appBarConfig?.title || appName || "Plan Management"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navigationSections?.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {/* Section Header */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSectionToggle(sectionIndex)}
                  >
                    <ListItemText
                      primary={section.title}
                      primaryTypographyProps={{
                        variant: "subtitle2",
                        fontWeight: "bold",
                        color: "text.secondary",
                      }}
                    />
                    {openSections[sectionIndex] ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Section Items */}
                <Collapse
                  in={openSections[sectionIndex]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {section.items?.map((item, itemIndex) => {
                      const IconComponent = iconMap[item.icon] || Assignment;
                      return (
                        <ListItem key={itemIndex} disablePadding sx={{ pl: 2 }}>
                          <ListItemButton
                            onClick={() => handleNavClick(item.path)}
                          >
                            <ListItemIcon>
                              <IconComponent />
                            </ListItemIcon>
                            <ListItemText primary={item.title} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MockMainLayout;
