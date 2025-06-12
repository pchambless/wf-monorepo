import { makeAutoObservable } from 'mobx';
import createLogger from '../utils/logger';
// Import constants that were missing
import * as constants from './core/constants';
// Move this import to the top
import { default as registerActionHandlers } from './actionHandlers';

const log = createLogger('ActionStore');

// Create a MobX store for tracking actions
class ActionTrackingStore {
  actionHistory = [];
  actionData = new Map();
  
  constructor() {
    makeAutoObservable(this);
  }
  
  trackAction(action, payload) {
    const timestamp = new Date().toISOString();
    const enhancedPayload = {
      ...payload,
      _timestamp: timestamp,
      _action: action
    };
    
    // Store in map instead of external store
    this.actionData.set(`%${action}`, enhancedPayload);
    
    // Add to history
    this.actionHistory.push({
      action,
      timestamp,
      payload: { ...payload }
    });
    
    // Keep history at a reasonable size
    if (this.actionHistory.length > 100) {
      this.actionHistory = this.actionHistory.slice(-100);
    }
    
    return enhancedPayload;
  }
  
  getActionData(action) {
    return this.actionData.get(action);
  }
  
  clearHistory() {
    this.actionHistory = [];
    this.actionData.clear();
  }
}

// Create and export singleton instance
export const actionTrackingStore = new ActionTrackingStore();

// Re-export all action constants
export const ACTIONS = constants.ACTIONS;
export const SELECTION = constants.SELECTION;
export const NAVIGATION = constants.NAVIGATION;
export const FORM = constants.FORM;
export const CRUD = constants.CRUD;
export const UI = constants.UI;

// Store subscribers keyed by action type
const subscribers = new Map();

// Generate a unique subscriber ID for tracking/removal
let nextSubscriberID = 0;
const getNextSubscriberId = () => {
  const id = `${nextSubscriberID.toString(16).padStart(6, '0')}`;
  nextSubscriberID++;
  return id;
};

/**
 * Trigger an action
 * @param {string} action - Action type
 * @param {Object} payload - Payload for the action
 * @param {Object} context - Additional context for action handlers
 */
export const triggerAction = (action, payload, context = {}) => {
  // Generate a unique ID for this action instance
  const actionId = `${action}-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  // Add timestamp and action type to payload for tracking
  const enhancedPayload = {
    ...payload,
    timestamp: Date.now(),
    actionType: action
  };
  
  // Add action type to context for handlers
  const enhancedContext = {
    ...context,
    actionType: action
  };

  // Log action for debugging
  log.debug(`Action triggered: ${action}`, enhancedPayload);
  
  // IMPROVEMENT: Only store important actions in external store
  const shouldStoreInExternalStore = action !== 'tabSelect';
  
  // Store action in tracking store instead of external store
  if (shouldStoreInExternalStore) {
    actionTrackingStore.trackAction(action, enhancedPayload);
  }
  
  // Dispatch to handlers
  dispatchToHandlers(action, enhancedPayload, enhancedContext);
  
  // Notify all subscribers for this action
  if (subscribers.has(action)) {
    const actionSubscribers = subscribers.get(action);
    actionSubscribers.forEach(callback => {
      try {
        callback(enhancedPayload, enhancedContext);
      } catch (error) {
        log.error(`Error in subscriber for ${action}`, error);
      }
    });
  }
  
  return actionId;
};

// Track subscriptions by caller
const subscriptionMap = new Map();

/**
 * Subscribe to an action
 * 
 * @param {string} actionType - Action type from constants
 * @param {Function} handler - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAction = (action, callback) => {
  if (!action || typeof callback !== 'function') {
    log.error('Invalid subscription parameters', { hasAction: !!action, callbackType: typeof callback });
    return () => {};
  }

  if (!subscribers.has(action)) {
    subscribers.set(action, new Map());
  }
  
  const actionSubscribers = subscribers.get(action);
  const subscriberId = getNextSubscriberId();
  actionSubscribers.set(subscriberId, callback);
  
  // Return unsubscribe function
  return () => {
    if (subscribers.has(action)) {
      subscribers.get(action).delete(subscriberId);
      log.debug(`Unsubscribed from ${action} (${subscriberId})`);
    }
  };
};

/**
 * Get the latest value of an action
 * 
 * @param {string} actionType - Action type from constants
 * @returns {object|null} The action payload or null
 */
export function getAction(actionType) {
  const actionKey = `%${actionType}`;
  return actionTrackingStore.getActionData(actionKey);
}

// For debugging - expose subscription map
if (process.env.NODE_ENV !== 'production') {
  window.__DEBUG_SUBSCRIPTION_MAP = subscriptionMap;
}

// Flag to enable/disable tracking - set this to true in welcome page
window.__TRACK_ACTIONS = false;

/**
 * Dispatch action to registered handlers
 * @param {string} action - Action type
 * @param {Object} payload - Payload for the action
 * @param {Object} context - Additional context for action handlers
 */
const dispatchToHandlers = (action, payload, context = {}) => {
  try {
    // Call handlers for this action type
    const handlers = registerActionHandlers[action];
    if (handlers && typeof handlers === 'function') {
      handlers(payload, context);
    }
  } catch (error) {
    log.error(`Error dispatching action ${action} to handlers`, error);
  }
};
