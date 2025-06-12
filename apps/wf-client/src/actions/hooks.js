import { useEffect, useState } from 'react';
import { getAction, subscribeToAction } from './actionStore';
import createLogger from '../utils/logger';

const log = createLogger('ActionHooks');

/**
 * React hook to use an action's current value
 * 
 * @param {string} actionType - The action type to subscribe to
 * @param {*} defaultValue - Default value if action is undefined
 * @returns {[any, Function]} - Current value and setter function
 */
export function useAction(actionType, defaultValue = null) {
  const [value, valueue] = useState(getAction(actionType)?.value || defaultValue);
  
  useEffect(() => {
    // Subscribe to updates
    const unsubscribe = subscribeToAction(actionType, (payload) => {
      valueue(payload);
    });
    
    // Get initial value
    const initialValue = getAction(actionType);
    if (initialValue !== undefined) {
      valueue(initialValue);
    }
    
    return unsubscribe;
  }, [actionType]);
  
  return [value, (newValue) => {
    // This is a shorthand to trigger the action
    import('./actionStore').then(({ triggerAction }) => {
      triggerAction(actionType, { value: newValue });
    });
  }];
}

/**
 * React hook to subscribe to an action without maintaining state
 * 
 * @param {string} actionType - The action type to subscribe to
 * @param {Function} callback - Function to call when action occurs
 */
export function useActionSubscription(actionType, callback) {
  useEffect(() => {
    log.debug(`Setting up subscription to ${actionType}`);
    const unsubscribe = subscribeToAction(actionType, callback);
    return () => {
      log.debug(`Cleaning up subscription to ${actionType}`);
      unsubscribe();
    };
  }, [actionType, callback]);
}
