import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Drawer, Toolbar } from '@mui/material';

import WidgetCanvas from './WidgetCanvas';
import CanvasSidebar from './CanvasSidebar';
import { useCanvasState } from './useCanvasState';

const theme = createTheme(); // You can customize this later

export default function StudioApp() {
  const {
    layout,
    addWidget,
    selectedId,
    setSelectedId
  } = useCanvasState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 260,
              boxSizing: 'border-box',
              padding: 2
            }
          }}
        >
          <Toolbar />
          <CanvasSidebar onAddWidget={addWidget} />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <WidgetCanvas
            layout={layout}
            selectedId={selectedId}
            onSelectItem={setSelectedId}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}