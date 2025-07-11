// contextStore.js - Dynamic contextual parameter persistence based on eventTypes
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { createLogger } from '@whatsfresh/shared-imports';
import { getEventType } from '../events/client/eventTypes.js';

const log = createLogger('ContextStore');
const STORAGE_KEY = 'whatsfresh_context_state';

// Create context for React components
export const ContextContext = React.createContext(null);

class ContextStore {
  // Dynamic parameters based on eventType primaryKeys
  parameters = {};
  
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedContext();
  }
  
  // Load contextual parameters from localStorage
  loadPersistedContext() {
    try {
      const savedContext = localStorage.getItem(STORAGE_KEY);
      if (savedContext) {
        this.parameters = JSON.parse(savedContext);
        // Clear sessionValid flag on load - require explicit login
        this.parameters.sessionValid = null;
        log.debug('Restored context state (sessionValid cleared)', this.parameters);
      }
    } catch (error) {
      log.error('Failed to load persisted context', error);
    }
  }
  
  // Save contextual parameters to localStorage
  persistContext() {
    try {
      // Only save non-null values to reduce storage size
      const nonNullParams = Object.entries(this.parameters)
        .filter(([_, value]) => value !== null)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nonNullParams));
      log.debug('Persisted context state', nonNullParams);
    } catch (error) {
      log.error('Failed to persist context', error);
    }
  }
  
  // Set a parameter value when user makes a selection
  setParameter(paramName, value) {
    this.parameters[paramName] = value;
    this.persistContext();
    log.debug('Context parameter set', { [paramName]: value });
  }
  
  // Get a parameter value
  getParameter(paramName) {
    return this.parameters[paramName] || null;
  }
  
  // Set the primaryKey value for an eventType (called when user selects a row)
  setEvent(eventType, selectedValue) {
    const eventDef = getEventType(eventType);
    if (eventDef?.primaryKey) {
      this.setParameter(eventDef.primaryKey, selectedValue);
      
      // Clear child parameters when parent selection changes
      this.clearChildParams(eventType);
    }
  }
  
  // Clear parameters for child eventTypes when parent changes
  clearChildParams(parentEventType) {
    const parentDef = getEventType(parentEventType);
    if (parentDef?.children) {
      parentDef.children.forEach(childEventType => {
        const childDef = getEventType(childEventType);
        if (childDef?.primaryKey) {
          this.parameters[childDef.primaryKey] = null;
          // Recursively clear grandchildren
          this.clearChildParams(childEventType);
        }
      });
      this.persistContext();
    }
  }
  
  // Auto-resolve parameters for an eventType
  resolveParams(eventType) {
    const eventDef = getEventType(eventType);
    if (!eventDef?.params) return {};
    
    const resolvedParams = {};
    
    for (const param of eventDef.params) {
      const paramName = param.replace(':', '');
      
      // Look up from contextual parameter store (everything is here now!)
      const value = this.getParameter(paramName);
      if (value !== null) {
        resolvedParams[paramName] = value;
      }
    }
    
    log.debug('Resolved event parameters', { eventType, resolvedParams });
    return resolvedParams;
  }
  
  // Get all parameters formatted for event calls (with : prefix)
  getEventParams(eventType) {
    const resolved = this.resolveParams(eventType);
    const eventParams = {};
    
    Object.entries(resolved).forEach(([key, value]) => {
      eventParams[`:${key}`] = value;
    });
    
    return eventParams;
  }
  
  // Clear all contextual parameters
  clearAllContext() {
    this.parameters = {};
    localStorage.removeItem(STORAGE_KEY);
    log.debug('All context parameters cleared');
  }
  
  // Get all parameters
  getAllParameters() {
    return { ...this.parameters };
  }
  
  // Check if all required parameters are available for an eventType
  hasRequiredParams(eventType) {
    const resolved = this.resolveParams(eventType);
    const eventDef = getEventType(eventType);
    
    if (!eventDef?.params) return true;
    
    for (const param of eventDef.params) {
      const paramName = param.replace(':', '');
      if (!resolved[paramName]) {
        log.warn('Missing required parameter', { eventType, paramName });
        return false;
      }
    }
    
    return true;
  }
  
  // Helper methods for common user attributes
  get currentUser() {
    return {
      userID: this.getParameter('userID'),
      firstName: this.getParameter('firstName'),
      lastName: this.getParameter('lastName'),
      userEmail: this.getParameter('userEmail'),
      roleID: this.getParameter('roleID'),
      dfltAcctID: this.getParameter('dfltAcctID')
    };
  }
  
  get userDisplayName() {
    const firstName = this.getParameter('firstName');
    const lastName = this.getParameter('lastName');
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return 'Not logged in';
  }
  
  get isAuthenticated() {
    // Only consider authenticated if we have both userID and explicit session validation
    // This prevents auto-login from stale localStorage data
    const userID = this.getParameter('userID');
    const sessionValid = this.getParameter('sessionValid');
    return userID !== null && sessionValid === true;
  }
  
  // Authentication methods
  logout() {
    log.info('Logout called, clearing auth parameters');
    
    // Clear all authentication-related parameters but keep hierarchical selections
    const authParams = ['userID', 'firstName', 'lastName', 'userEmail', 'roleID', 'dfltAcctID', 'acctID', 'sessionValid'];
    authParams.forEach(param => {
      this.parameters[param] = null;
    });
    this.persistContext();
    
    log.info('User logged out, auth parameters cleared', { 
      isAuthenticated: this.isAuthenticated,
      remainingParams: Object.keys(this.parameters).filter(key => this.parameters[key] !== null)
    });
  }
}

const contextStore = new ContextStore();

// Hook for functional components
export const useContextStore = () => {
  return contextStore;
};

export default contextStore;