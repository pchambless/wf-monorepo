import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';

import theme from './theme';
import { ROUTES } from '@whatsfresh/shared-config/src/admin/routes';
import StudioApp from '@whatsfresh/shared-ui/src/studio/StudioApp'; 
import { pageMapRegistry } from '@whatsfresh/shared-config/src/admin/pageMapRegistry';
import { createApiClient, createEventService } from '@whatsfresh/shared-api';

// TEMP: Direct import until you're ready for dynamic loading
import AcctList from './pages/acctList';
import UserList from './pages/userList';
import CrudLayout from '@crud/Layout'; // or wherever your CrudLayout lives

const eventService = createEventService();

const App = () => {
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Initialize event service immediately on app load
    const initEvents = async () => {
      try {
        await eventService.initialize();
        setEventsLoaded(true);
      } catch (err) {
        setLoadError(err.message);
      }
    };

    initEvents();
  }, []);

  // Show loading state until events are ready
  if (!eventsLoaded) {
    return <CircularProgress />;
  }

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<CircularProgress />}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.acctList.path} replace />} />
            <Route
              path={ROUTES.acctList.path}
              element={<CrudLayout pageMap={pageMapRegistry.acctList} PageComponent={AcctList} />}
            />
            <Route
              path={ROUTES.userList.path}
              element={<CrudLayout pageMap={pageMapRegistry.userList} PageComponent={UserList} />}
            />
            <Route path="/studio" element={<StudioApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </Router>
  );
};

export default App;