import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SimpleLayout from "./layouts/SimpleLayout";
import { getNavigationSections, getAppBarConfig } from "./config/navigation";
import { ROUTES } from "./config/routes";
import { loadMermaidLibrary } from "./utils/mermaidLoader";

// Import Studio page directly for full-screen rendering
const StudioPage = lazy(() => import("./pages/Studio"));

const App = () => {
  // Load mermaid.js globally for Studio
  useEffect(() => {
    loadMermaidLibrary().catch(console.error);
  }, []);

  // Studio-specific route generation
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
              <PageComponent
                mode="studio"
              />
            </Suspense>
          }
        />
      );
    });
  };

  return (
    <Router>
      <Routes>
        {/* Studio route - full screen, no SimpleLayout */}
        <Route 
          path="/studio"
          element={
            <Suspense fallback={<div>Loading Studio...</div>}>
              <StudioPage mode="studio" />
            </Suspense>
          }
        />
        
        {/* All other routes use SimpleLayout */}
        <Route 
          path="/*"
          element={
            <SimpleLayout
              navigationSections={getNavigationSections()}
              appBarConfig={getAppBarConfig()}
              appName="WhatsFresh Studio"
              onLogout={() => {
                console.log("Studio logout clicked");
              }}
            >
              <Routes>
                {/* Default route */}
                <Route
                  path="/"
                  element={
                    <div style={{ padding: "20px" }}>
                      <h1>WhatsFresh Studio</h1>
                      <p>Visual EventType Design & Development Environment</p>
                      <p>Navigate to Studio to start designing your eventTypes.</p>
                    </div>
                  }
                />
              </Routes>
            </SimpleLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;