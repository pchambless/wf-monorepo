/**
 * Plan Management App Routes Configuration
 * Basic routing for plan management focused app
 */

export const ROUTES = {
  dashboard: {
    path: "/",
    title: "Dashboard",
  },
  plans: {
    path: "/plans",
    title: "All Plans",
  },
  planStatus: {
    path: "/plans/status",
    title: "Plan Status",
  },
  communications: {
    path: "/plans/communications",
    title: "Communications",
  },
  impacts: {
    path: "/plans/impacts",
    title: "Impact Tracking",
  },
  createPlan: {
    path: "/plans/create",
    title: "Create Plan",
  },
  reports: {
    path: "/reports",
    title: "Reports",
  },
};

export default {
  ROUTES,
};
