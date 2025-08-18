/**
  * Plan Management App Navigation Configuration
  * Consolidated navigation for unified plan management
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
//        {
//          title: "Plan Manager",
//          path: "/plans",
//          icon: "Assignment",
//        },
        {
          title: 'Studio',
          path: '/studio',
          icon: 'design',
          devOnly: true
        },
        {
          title: 'Sketch Pad',
          path: 'https://asciiflow.com',
          icon: '📝',
          external: true
        }
      ],
    },
  ];
};

export const getAppBarConfig = () => {
  return {
    title: "Plan Management",
    showUserMenu: false,
    showNotifications: false,
  };
};