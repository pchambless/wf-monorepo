import createLogger from './logger';
import { ROUTES, getNavSections } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('NavHelper');

export const getRoutesBySection = (section) => {
  return Object.values(ROUTES).filter(route => route.section === section);
};

/**
 * Get navigation menu items by category, with async loading of routes
 */
export const getNavItems = async (category) => {
  const allRoutes = getNavSections();
  log.info(`Get All Routes`);

  return allRoutes.filter(route => 
    route.navigation?.category === category && 
    route.navigation?.showInMenu === true
  ).sort((a, b) => 
    (a.navigation?.order || 99) - (b.navigation?.order || 99)
  );
};

/**
 * Generate navigation links - with async handling
 */
export const getNavLinks = async (category) => {
  const items = await getNavItems(category);
  log.info(`getNavLinks: ${category}`);
  
  return items.map(item => ({
    path: item.path,
    label: item.label,
    icon: item.navigation?.icon
  }));
};
