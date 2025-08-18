/**
   * Plan Management App Routes Configuration
   * Consolidated routing for unified plan management
   */

export const ROUTES = {
  dashboard: {
    path: "/",
    title: "Dashboard",
  },
//  planManager: {
//    path: "/plans",
//    title: "Plan Manager",
//  },
  reports: {
    path: "/reports",
    title: "Reports",
  },
  studio: {
    path: '/studio',
    component: () => import('../studio/StudioApp.jsx'),
    name: 'EventType Studio'
  },
  sketch: {
    path: '/sketch',
    component: () => import('../pages/SketchPad.jsx'),
    name: 'ASCII Sketch Pad'
  }
};
