import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { registerActionHandlers } from './actionHandlers';
import createLogger from '../utils/logger';

const ActionHandlerContext = createContext();
const log = createLogger('ActionHandlerContext');

/**
 * Provider component for action handlers
 * Registers action handlers when mounted and cleans up when unmounted
 */
export const ActionHandlerProvider = ({ children, options = { executeHandlers: true, logOnly: false } }) => {
  const [status, setStatus] = useState('initializing');
  // Use a ref instead of state for unsubscribers to avoid re-renders
  const unsubscribersRef = useRef([]);

  // Register action handlers on mount only, not on every render
  useEffect(() => {
    let isMounted = true;
    
    const setupHandlers = async () => {
      try {
        log.info('Registering action handlers', options);
        const unsubs = registerActionHandlers(options);
        
        if (isMounted) {
          unsubscribersRef.current = unsubs;
          setStatus('registered');
          log.info(`${unsubs.length} action handlers registered successfully`);
        }
      } catch (error) {
        if (isMounted) {
          log.error('Failed to register action handlers', error);
          setStatus('error');
        }
      }
    };
    
    setupHandlers();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      log.info('Unregistering action handlers');
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, [options]); // Empty dependency array to run once on mount

  const value = {
    status,
    refresh: () => {
      // Clean up existing subscriptions
      unsubscribersRef.current.forEach(unsub => unsub());
      
      // Re-register handlers
      const unsubs = registerActionHandlers(options);
      unsubscribersRef.current = unsubs;
      setStatus('refreshed');
      return unsubs.length;
    }
  };

  return (
    <ActionHandlerContext.Provider value={value}>
      {children}
    </ActionHandlerContext.Provider>
  );
};

/**
 * Hook to access the action handler context
 */
export const useActionHandlers = () => {
  const context = useContext(ActionHandlerContext);
  
  if (!context) {
    throw new Error('useActionHandlers must be used within an ActionHandlerProvider');
  }
  
  return context;
};
