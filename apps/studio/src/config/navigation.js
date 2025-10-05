/**
 * Studio Navigation Configuration
 * Based on wf-plan-management pattern but Studio-specific
 */

export const getNavigationSections = () => [
  {
    title: "Studio",
    items: [
      {
        title: "EventType Designer", 
        path: "/studio",
        icon: "🎨"
      }
    ]
  },
  {
    title: "Apps",
    items: [
      {
        title: "Plans App",
        path: "/studio",
        icon: "📋"
      }
    ]
  }
];

export const getAppBarConfig = () => ({
  title: "WhatsFresh Studio",
  showUserMenu: true,
  showAppSelector: true,
  availableApps: [
    { key: "studio", title: "Studio", path: "/" },
    { key: "plans", title: "Plan Management", path: "http://localhost:3003" },
    { key: "client", title: "Client App", path: "http://localhost:3000" },
    { key: "admin", title: "Admin", path: "http://localhost:3002" }
  ]
});