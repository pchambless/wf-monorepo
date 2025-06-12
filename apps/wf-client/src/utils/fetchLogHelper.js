import createLogger from './logger';

const log = createLogger('FetchHelper');

/**
 * Override the browser's fetch logging with our custom logger
 * This prevents duplicate logs in the console
 */
export const setupFetchLogging = () => {
  // Only do this in development mode
  if (process.env.NODE_ENV !== 'development') return;
  
  // Store the original fetch for later restoration if needed
  const originalFetch = window.fetch;
  
  // Override the fetch function to use our logger
  window.fetch = async function(...args) {
    const url = args[0]?.url || args[0];
    const method = args[1]?.method || 'GET';
    
    try {
      log.debug(`${method} request to ${url}`);
      const response = await originalFetch.apply(this, args);
      return response;
    } catch (error) {
      log.error(`${method} request to ${url} failed`, error);
      throw error;
    }
  };
  
  log.info('Custom fetch logging enabled');
  
  return () => {
    window.fetch = originalFetch;
    log.info('Original fetch restored');
  };
};

/**
 * Disable browser's default fetch logging for cleaner console
 */
export const disableBrowserFetchLogs = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Use this with caution as it will affect all console logs matching this pattern
  // Chrome DevTools allows filtering out unwanted logs with the 
  // following filter notation in the console: -/localhost:3001/
  
  if (window.console && window.console.filter) {
    // Chrome-specific feature
    window.console.filter.exclude((log) => {
      return typeof log === 'string' && 
        (log.includes('localhost:3001/api') || log.includes('Fetch finished loading'));
    });
    
    log.info('Browser fetch logs filtered in console');
  }
};
