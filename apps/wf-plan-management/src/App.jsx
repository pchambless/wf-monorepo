import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SimpleLayout from "./components/SimpleLayout";
import { getNavigationSections, getAppBarConfig } from "./config/navigation";
import { ROUTES } from "./config/routes";

// Import consolidated page components
import Dashboard from "./pages/Dashboard";

// Lazy load Studio and SketchPad to avoid loading issues
const Studio = lazy(() => import("./studio/StudioApp.jsx"));
const SketchPad = lazy(() => import("./pages/SketchPad.jsx"));
// import PlanManager from "./pages/PlanManager";

const App = () => {
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
          <Route path={ROUTES.dashboard.path} element={<Dashboard />} />
          <Route
            path={ROUTES.studio.path}
            element={
              <Suspense fallback={<div>Loading Studio...</div>}>
                <Studio />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.sketch.path}
            element={
              <Suspense fallback={<div>Loading Sketch Pad...</div>}>
                <SketchPad />
              </Suspense>
            }
          />
        </Routes>
      </SimpleLayout>
    </Router>
  );
};

export default App;
