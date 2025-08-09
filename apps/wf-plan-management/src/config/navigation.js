/**
 * Plan Management App Navigation Configuration
 * Plan-focused navigation sections - cleaner than mixed wf-client sidebar
 */

export const getNavigationSections = () => {
  return [
    {
      title: "Plan Management",
      items: [
        {
          title: "Dashboard",
          path: "/",
          icon: "Dashboard",
        },
        {
          title: "All Plans",
          path: "/plans",
          icon: "Assignment",
        },
        {
          title: "Plan Status",
          path: "/plans/status",
          icon: "FilterList",
        },
        {
          title: "Communications",
          path: "/plans/communications",
          icon: "Chat",
        },
        {
          title: "Impact Tracking",
          path: "/plans/impacts",
          icon: "Timeline",
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "Create Plan",
          path: "/plans/create",
          icon: "Add",
        },
        {
          title: "Reports",
          path: "/reports",
          icon: "Assessment",
        },
      ],
    },
  ];
};

export const getAppBarConfig = () => {
  return {
    title: "Plan Management",
    showUserMenu: false, // Skip for Phase 2
    showNotifications: false,
  };
};

export default {
  getNavigationSections,
  getAppBarConfig,
};
