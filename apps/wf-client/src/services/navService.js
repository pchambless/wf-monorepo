import { resolveRoute, getRouteKeyByEvent } from '@whatsfresh/shared-config/src/routes';
// Removed unused getRoute import
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';

const log = createLogger('NavService');

// Will be initialized with the navigate function from useNavigate()
let navigateFunc = null;

/**
 * Navigation service for consistent routing throughout the application
 */
const navService = {
  /**
   * Initialize the service with React Router's navigate function
   * @param {Function} navigate - React Router's navigate function
   */
  init(navigate) {
    navigateFunc = navigate;
    log.debug('Navigation service initialized');
  },
  
  /**
   * Core navigation method
   * @param {string} path - Route path
   * @param {Object} options - Navigation options (replace, state)
   */
  navigate(path, options = {}) {
    if (!navigateFunc) {
      log.warn('Navigation attempted before service initialization');
      return false;
    }
    
    log.debug(`Navigating to: ${path}`, options);
    navigateFunc(path, options);
    return true;
  },
  
  /**
   * Navigate using a listEvent identifier
   * @param {string} listEvent - The listEvent identifier for the route
   * @param {Object} params - Parameters for the route
   * @param {Object} options - Navigation options (replace, state)
   */
  byListEvent(listEvent, params = {}, options = {}) {
    // Get the route key for this event
    const routeKey = getRouteKeyByEvent(listEvent);
    
    if (!routeKey) {
      log.error(`No route found for list event: ${listEvent}`);
      return false;
    }
    
    // Auto-inject accountId if needed and available
    if (!params.acctID && accountStore.currentAcctID) {
      params.acctID = accountStore.currentAcctID;
    }
    
    const resolvedPath = resolveRoute(routeKey, params);
    return this.navigate(resolvedPath, options);
  },
  
  /**
   * Common navigation patterns
   */
  afterLogin() {
    return this.byListEvent('dashList', {}, { replace: true });
  },
  
  toIngredientTypes() {
    return this.byListEvent('ingrTypeList', { acctID: accountStore.currentAcctID });
  },
  
  toProductsSection() {
    return this.byListEvent('prodTypeList', { acctID: accountStore.currentAcctID });
  },
  
  toReferenceSection() {
    return this.byListEvent('brndList', { acctID: accountStore.currentAcctID });
  },
  
  /**
   * Logout the user and navigate to the login page
   */
  logout() {
    // Clear auth data
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    log.info('User logged out');
    
    // Navigate by listEvent - this is the clean way!
    return this.byListEvent('loginList', {}, { replace: true });
  }
};

export default navService;
