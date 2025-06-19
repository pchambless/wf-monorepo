import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';

import theme from './theme';
import { ROUTES } from '@whatsfresh/shared-config/src/admin/routes';
import { pageMapRegistry } from '@whatsfresh/shared-config/src/admin/pageMapRegistry';

// TEMP: Direct import until you're ready for dynamic loading
import AcctList from './pages/acctList';
import UserList from './pages/userList';
import CrudLayout from '@crud/Layout'; // or wherever your CrudLayout lives

const App = () => {
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </Router>
  );
};

export default App;