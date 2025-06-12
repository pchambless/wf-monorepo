import createLogger from '../../utils/logger';
import { setPageTitle, setBreadcrumbs } from '../../stores/pageStore';

const log = createLogger('ActionHandlers.Navigation');

/**
 * Navigation action handlers
 */
const navigationHandlers = {
  PAGE_SELECT: {
    description: "Handle page navigation",
    payload: {
      path: "Route path",
      pageName: "Name of the page",
      label: "Display label for the page"
    },
    handlers: [
      {
        name: "Update breadcrumbs",
        code: `setBreadcrumbs([
          { label: 'Home', path: '/' },
          { label: payload.label, path: payload.path }
        ])`,
        implementation: (payload) => {
          if (payload.path && payload.label) {
            log.info(`Updating breadcrumbs for: ${payload.label}`);
            setBreadcrumbs([
              { label: 'Home', path: '/' },
              { label: payload.label, path: payload.path }
            ]);
          }
        }
      },
      {
        name: "Update page title",
        code: `setPageTitle(payload.label)`,
        implementation: (payload) => {
          if (payload.label) {
            log.info(`Setting page title to: ${payload.label}`);
            setPageTitle(payload.label);
          }
        }
      },
      {
        name: "Track navigation for analytics",
        implementation: (payload) => {
          log.info(`Page navigation: ${payload.path}`, { 
            timestamp: payload.timestamp,
            pageName: payload.pageName
          });
        }
      }
    ]
  },
  
  // Replace TAB_SELECT with DETAIL_NAVIGATE
  DETAIL_NAVIGATE: {
    description: "Handle navigation to detail page",
    payload: {
      parentType: "Type of parent entity",
      parentId: "ID of parent entity",
      childType: "Type of child entity",
      path: "Target navigation path"
    },
    handlers: [
      {
        name: "Update breadcrumbs with detail context",
        implementation: (payload) => {
          if (payload.parentType && payload.parentId) {
            log.info(`Updating breadcrumbs for ${payload.childType} detail page`);
            // Build path-based breadcrumbs instead of tab-based ones
            const crumbs = [
              { label: 'Home', path: '/' },
              { label: payload.parentType, path: `/${payload.parentType.toLowerCase()}` }
            ];
            
            // Add parent entity as a breadcrumb
            if (payload.parentName) {
              crumbs.push({
                label: payload.parentName,
                path: `/${payload.parentType.toLowerCase()}/${payload.parentId}`
              });
            }
            
            // Add child entity type
            if (payload.childType) {
              crumbs.push({
                label: payload.childType,
                path: payload.path
              });
            }
            
            setBreadcrumbs(crumbs);
          }
        }
      },
      {
        name: "Update page title with detail context",
        implementation: (payload) => {
          if (payload.childType) {
            const title = `${payload.childType}${payload.parentName ? ` - ${payload.parentName}` : ''}`;
            log.info(`Setting detail page title: ${title}`);
            setPageTitle(title);
          }
        }
      }
    ]
  },
  
  // Add handler for breadcrumb navigation
  BREADCRUMB_NAVIGATE: {
    description: "Handle navigation via breadcrumbs",
    payload: {
      path: "Target path from breadcrumb",
      level: "Breadcrumb hierarchy level"
    },
    handlers: [
      {
        name: "Track breadcrumb navigation for analytics",
        implementation: (payload) => {
          log.info(`Breadcrumb navigation: ${payload.path}`, {
            level: payload.level,
            timestamp: Date.now()
          });
        }
      }
    ]
  }
};

export default navigationHandlers;
