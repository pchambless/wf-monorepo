import React, { createContext, useContext, useCallback } from 'react';
import { triggerAction, subscribeToAction, getAction } from './actionStore';
import createLogger from '../utils/logger';

const log = createLogger('ActionProvider');
const ActionContext = createContext(null);

/**
 * Provider component that gives access to the action system
 */
export function ActionProvider({ children }) {
  const contextValue = {
    triggerAction: useCallback((type, payload) => {
      log.debug(`Action triggered via Provider: ${type}`);
      return triggerAction(type, payload);
    }, []),
    
    subscribeToAction: useCallback((type, callback) => {
      log.debug(`Subscription created via Provider: ${type}`);
      return subscribeToAction(type, callback);
    }, []),
    
    getAction: useCallback((type) => {
      return getAction(type);
    }, [])
  };
  
  return (
    <ActionContext.Provider value={contextValue}>
      {children}
    </ActionContext.Provider>
  );
}

/**
 * Hook to use the action context
 */
export function useActionContext() {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActionContext must be used within an ActionProvider');
  }
  return context;
}

export default ActionProvider;
