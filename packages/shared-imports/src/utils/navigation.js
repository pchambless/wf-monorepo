/**
 * Shared navigation utilities that work with app-specific routes
 * Uses the existing eventTypes/routes.js infrastructure
 */
import { useNavigate } from 'react-router-dom';
import createLogger from './logger.js';

const log = createLogger('Navigation');

/**
 * Create a navigation service that uses app-specific routes
 * @param {Object} routes - Routes object from app's routes.js (e.g., ROUTES)
 * @returns {Object} Navigation service with typed methods
 */
export function createNavigationService(routes) {
  return {
    // Core navigation methods
    toDashboard: () => routes.DASHBOARD?.path || '/dashboard',
    toLogin: () => routes.LOGIN?.path || '/login',
    
    // Dynamic route resolution
    toRoute: (routeKey, params = {}) => {
      const route = routes[routeKey];
      if (!route) {
        log.warn(`Route ${routeKey} not found`);
        return '/';
      }
      
      let path = route.path;
      Object.entries(params).forEach(([param, value]) => {
        path = path.replace(`:${param}`, value);
      });
      
      return path;
    },
    
    // Navigate by event type
    toEventType: (eventType) => {
      const route = Object.values(routes).find(r => r.listEvent === eventType);
      if (!route) {
        log.warn(`No route found for event type: ${eventType}`);
        return '/';
      }
      return route.path;
    }
  };
}

/**
 * Hook that provides navigation functions using app routes
 * @param {Object} routes - Routes object from app's routes.js
 * @returns {Object} Navigation functions that actually navigate
 */
export function useAppNavigation(routes) {
  const navigate = useNavigate();
  const navService = createNavigationService(routes);
  
  return {
    // Navigation methods that actually navigate
    goToDashboard: () => {
      const path = navService.toDashboard();
      log.info(`Navigating to dashboard: ${path}`);
      navigate(path);
    },
    
    goToLogin: () => {
      const path = navService.toLogin();
      log.info(`Navigating to login: ${path}`);
      navigate(path);
    },
    
    goToRoute: (routeKey, params = {}) => {
      const path = navService.toRoute(routeKey, params);
      log.info(`Navigating to route ${routeKey}: ${path}`);
      navigate(path);
    },
    
    goToEventType: (eventType) => {
      const path = navService.toEventType(eventType);
      log.info(`Navigating to event ${eventType}: ${path}`);
      navigate(path);
    },
    
    // Direct navigate access for custom navigation
    navigate,
    
    // Path getters (don't navigate, just return paths)
    paths: navService
  };
}