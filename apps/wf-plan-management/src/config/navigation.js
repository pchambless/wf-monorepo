/**
  * Plan Management App Navigation Configuration
  * Dynamic navigation based on page eventTypes
  */

// Import page eventTypes to get routePath dynamically
function getPageRoutes() {
  const routes = {};
  
  try {
    // Use webpack's require.context to get all page eventType files
    const pageContext = require.context('../pages', true, /^\.\/\w+\/page\w+\.js$/);
    
    for (const modulePath of pageContext.keys()) {
      try {
        const module = pageContext(modulePath);
        
        // Extract page folder name from path (./Dashboard/pageDashboard.js -> Dashboard)
        const pageFolder = modulePath.split('/')[1];
        
        // Find the exported eventType object
        const eventTypeExport = Object.values(module).find(exp => 
          exp && typeof exp === 'object' && exp.routePath && exp.category === 'page'
        );
        
        if (eventTypeExport) {
          routes[pageFolder.toLowerCase()] = {
            path: eventTypeExport.routePath,
            title: eventTypeExport.title,
            purpose: eventTypeExport.purpose
          };
        }
      } catch (moduleError) {
        console.warn('Failed to load navigation module:', modulePath, moduleError);
      }
    }
  } catch (error) {
    console.error('Navigation scanning error:', error);
  }
  
  console.log('🧭 Auto-discovered navigation routes:', routes);
  return routes;
}

export const getNavigationSections = () => {
  const pageRoutes = getPageRoutes();
  
  return [
    {
      title: "Plan Management",
      items: [
        {
          title: "📊 Dashboard", 
          path: pageRoutes.dashboard?.path || "/dashboard",
        },
        {
          title: "📋 Plan Manager",
          path: pageRoutes.planmanager?.path || "/plan-manager", 
        },
        {
          title: '🎨 Studio',
          path: pageRoutes.studio?.path || "/studio",
          devOnly: true
        },
        {
          title: '📝 Sketch Pad',
          path: 'https://asciiflow.com',
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