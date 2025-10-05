/**
 * Plan Management App Routes Configuration
 * Dynamic route discovery using webpack require.context
 */

/**
 * Dynamically scan pages for eventTypes with routePath
 */
function scanPageRoutes() {
  const routes = {};
  
  try {
    // Use webpack's require.context to get all page eventType files in /page subdirectories
    const pageContext = require.context('../pages', true, /^\.\/\w+\/page\/page\w+\.js$/);
    
    for (const modulePath of pageContext.keys()) {
      try {
        const module = pageContext(modulePath);
        
        // Extract page folder name from path (./Dashboard/pageDashboard.js -> Dashboard)
        const pageFolder = modulePath.split('/')[1];
        const routeKey = pageFolder.toLowerCase();
        
        // Find the exported eventType object
        const eventTypeExport = Object.values(module).find(exp => 
          exp && typeof exp === 'object' && exp.routePath && exp.category === 'page'
        );
        
        if (eventTypeExport) {
          routes[routeKey] = {
            path: eventTypeExport.routePath,
            component: pageFolder,
            eventType: Object.keys(module)[0], // First export name
            title: eventTypeExport.title,
            purpose: eventTypeExport.purpose
          };
        }
      } catch (moduleError) {
        console.warn('Failed to load page module:', modulePath, moduleError);
      }
    }
  } catch (error) {
    console.error('Route scanning error:', error);
  }
  
  console.log('🛣️ Auto-discovered routes:', routes);
  return routes;
}

// Generate routes from pages (synchronous)
export const ROUTES = scanPageRoutes();

// Debug log
console.log('🔍 ROUTES object:', ROUTES);
console.log('🔍 Available route keys:', Object.keys(ROUTES));

export default ROUTES;
