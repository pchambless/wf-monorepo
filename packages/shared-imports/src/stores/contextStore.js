// contextStore.js - Dynamic contextual parameter persistence based on eventTypes
import { makeAutoObservable } from "mobx";
import React from "react";
import { createLogger } from "@whatsfresh/shared-imports";
// REMOVED: Server eventType imports - contextStore is now a simple key-value store
// Hierarchical clearing logic moved to WorkflowEngine where it belongs
// import { getEventType } from "../../../../apps/wf-server/server/events/client/eventTypes.js";

const log = createLogger("ContextStore");
const STORAGE_KEY = "whatsfresh_context_state";

// Create context for React components
export const ContextContext = React.createContext(null);

class ContextStore {
  // Dynamic parameters based on eventType primaryKeys
  parameters = {};

  // Subscription system for parameter changes
  subscribers = {};

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
        log.debug(
          "Restored context state (sessionValid cleared)",
          this.parameters
        );
      }
    } catch (error) {
      log.error("Failed to load persisted context", error);
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
      log.debug("Persisted context state", nonNullParams);
    } catch (error) {
      log.error("Failed to persist context", error);
    }
  }

  // Set a parameter value when user makes a selection
  setVal(paramName, value) {
    const oldValue = this.parameters[paramName];
    this.parameters[paramName] = value;
    this.persistContext();
    log.debug("Context parameter set", { [paramName]: value });

    // Notify subscribers if value changed
    if (oldValue !== value && this.subscribers[paramName]) {
      this.subscribers[paramName].forEach((callback) => {
        try {
          callback(value, oldValue);
        } catch (error) {
          log.error("Error in parameter change callback", { paramName, error });
        }
      });
    }
  }

  // Get a parameter value
  getVal(paramName) {
    return this.parameters[paramName] || null;
  }

  // Clear multiple parameters (variable arguments)
  clearVals(...paramNames) {
    paramNames.forEach(name => {
      this.parameters[name] = null;
    });
    this.persistContext();
    log.debug("Cleared parameters", { paramNames });
  }

  // DELETED: Complex eventType-aware methods moved to WorkflowEngine
  // setEvent(), clearChildParams(), resolveParams(), getEventParams()
  // ContextStore is now a simple key-value store

  // Clear all contextual parameters
  clearAllContext() {
    this.parameters = {};
    localStorage.removeItem(STORAGE_KEY);
    log.debug("All context parameters cleared");
  }

  // Get all parameters
  getAllVals() {
    return { ...this.parameters };
  }

  // DELETED: hasRequiredParams() moved to WorkflowEngine
  // Parameter validation now handled by workflow triggers

  // Helper methods for common user attributes
  get currentUser() {
    return {
      userID: this.getVal("userID"),
      firstName: this.getVal("firstName"),
      lastName: this.getVal("lastName"),
      userEmail: this.getVal("userEmail"),
      roleID: this.getVal("roleID"),
      dfltAcctID: this.getVal("dfltAcctID"),
    };
  }

  get userDisplayName() {
    const firstName = this.getVal("firstName");
    const lastName = this.getVal("lastName");
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return "Not logged in";
  }

  get isAuthenticated() {
    // Only consider authenticated if we have both userID and explicit session validation
    // This prevents auto-login from stale localStorage data
    const userID = this.getVal("userID");
    const sessionValid = this.getVal("sessionValid");
    return userID !== null && sessionValid === true;
  }

  // Authentication methods
  logout() {
    log.info("Logout called, clearing auth parameters");

    // Clear all authentication-related parameters but keep hierarchical selections
    this.clearVals(
      "userID",
      "firstName", 
      "lastName",
      "userEmail",
      "roleID",
      "dfltAcctID",
      "acctID",
      "sessionValid"
    );

    log.info("User logged out, auth parameters cleared", {
      isAuthenticated: this.isAuthenticated,
      remainingParams: Object.keys(this.parameters).filter(
        (key) => this.parameters[key] !== null
      ),
    });
  }

  // Subscription system for parameter changes
  subscribe(paramName, callback) {
    if (!this.subscribers[paramName]) {
      this.subscribers[paramName] = [];
    }
    this.subscribers[paramName].push(callback);
    log.debug("Parameter subscription added", {
      paramName,
      subscriberCount: this.subscribers[paramName].length,
    });

    // Return unsubscribe function
    return () => this.unsubscribe(paramName, callback);
  }

  unsubscribe(paramName, callback) {
    if (this.subscribers[paramName]) {
      this.subscribers[paramName] = this.subscribers[paramName].filter(
        (cb) => cb !== callback
      );
      log.debug("Parameter subscription removed", {
        paramName,
        subscriberCount: this.subscribers[paramName].length,
      });

      // Clean up empty subscriber arrays
      if (this.subscribers[paramName].length === 0) {
        delete this.subscribers[paramName];
      }
    }
  }

  // Get all subscribers for debugging
  getSubscribers() {
    return Object.keys(this.subscribers).reduce((acc, key) => {
      acc[key] = this.subscribers[key].length;
      return acc;
    }, {});
  }
}

const contextStore = new ContextStore();

// Hook for functional components
export const useContextStore = () => {
  return contextStore;
};

export default contextStore;
