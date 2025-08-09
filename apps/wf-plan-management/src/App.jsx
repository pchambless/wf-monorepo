import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Removed MUI imports to avoid React version conflicts

// Use SimpleLayout for Plan 0039 - avoids MUI React version conflicts
import SimpleLayout from "./components/SimpleLayout";

// Import navigation config
import { getNavigationSections, getAppBarConfig } from "./config/navigation";
import { ROUTES } from "./config/routes";

// Import page components
import Dashboard from "./pages/Dashboard";
import AllPlans from "./pages/AllPlans";
import PlanStatus from "./pages/PlanStatus";
import Communications from "./pages/Communications";
import ImpactTracking from "./pages/ImpactTracking";
import CreatePlan from "./pages/CreatePlan";
import Reports from "./pages/Reports";

const App = () => {
  return (
    <Router>
      <SimpleLayout
        navigationSections={getNavigationSections()}
        appBarConfig={getAppBarConfig()}
        appName="Plan Management"
        onLogout={() => {
          // Phase 3: Will add proper logout
          console.log("Logout clicked");
        }}
      >
        <Routes>
          <Route path={ROUTES.dashboard.path} element={<Dashboard />} />
          <Route path={ROUTES.plans.path} element={<AllPlans />} />
          <Route path={ROUTES.planStatus.path} element={<PlanStatus />} />
          <Route
            path={ROUTES.communications.path}
            element={<Communications />}
          />
          <Route path={ROUTES.impacts.path} element={<ImpactTracking />} />
          <Route path={ROUTES.createPlan.path} element={<CreatePlan />} />
          <Route path={ROUTES.reports.path} element={<Reports />} />
        </Routes>
      </SimpleLayout>
    </Router>
  );
};

export default App;
