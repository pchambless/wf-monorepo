import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SimpleLayout from "./components/SimpleLayout";
import { getNavigationSections, getAppBarConfig } from "./config/navigation";
import { ROUTES } from "./config/routes";

const App = () => {
  // Dynamic route generation from discovered pages
  const generateRoutes = () => {
    return Object.entries(ROUTES).map(([routeKey, route]) => {
      // Lazy load each page component
      const PageComponent = lazy(() => import(`./pages/${route.component}`));
      
      return (
        <Route
          key={routeKey}
          path={route.path}
          element={
            <Suspense fallback={<div>Loading {route.title || route.component}...</div>}>
              <PageComponent />
            </Suspense>
          }
        />
      );
    });
  };

  return (
    <Router>
      <SimpleLayout
        navigationSections={getNavigationSections()}
        appBarConfig={getAppBarConfig()}
        appName="Plan Management"
        onLogout={() => {
          console.log("Logout clicked");
        }}
      >
        <Routes>
          {generateRoutes()}
          {/* Default route */}
          <Route path="/" element={<div>Welcome to Plan Management</div>} />
        </Routes>
      </SimpleLayout>
    </Router>
  );
};

export default App;
