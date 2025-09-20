// contextStore.js - Database-driven contextual parameter persistence
import { makeAutoObservable } from "mobx";
import React from "react";
import { createLogger } from "@whatsfresh/shared-imports";
import { execEvent } from "../api/execEvent.js";
// Database-driven context using SharedQueries: setVal(46), getVal(47), clearVals(48)

const log = createLogger("ContextStore");

// SharedQueries xrefIds for context operations
const SET_VAL_XREF = 46;
const GET_VAL_XREF = 47;
const CLEAR_VALS_XREF = 48;

// Create context for React components
export const ContextContext = React.createContext(null);

class ContextStore {
  // Dynamic parameters based on eventType primaryKeys
  parameters = {};

  // Subscription system for parameter changes
  subscribers = {};

  constructor() {
    makeAutoObservable(this);
    this.initializeContext();
  }

  // Initialize context - database-driven, no localStorage
  initializeContext() {
    // Context is now loaded on-demand from database
    // No need to preload - getVal will fetch from database as needed
    log.debug("Database-driven context initialized");
  }

  // Get user info for database operations
  get userInfo() {
    return {
      email: this.parameters.userEmail || 'unknown@email.com',
      firstName: this.parameters.firstName || 'Unknown'
    };
  }

  // Set a parameter value - database-driven
  async setVal(paramName, value) {
    try {
      const oldValue = this.parameters[paramName];
      const { email, firstName } = this.userInfo;

      // Store in database via setVal SharedQuery
      await execEvent(SET_VAL_XREF, {
        email,
        paramName,
        paramVal: value,
        firstName
      });

      // Update local cache for immediate UI response
      this.parameters[paramName] = value;
      log.debug("Context parameter set in database", { [paramName]: value });

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
    } catch (error) {
      log.error("Failed to set context parameter", { paramName, value, error });
      throw error;
    }
  }

  // Get a parameter value - database-driven, returns tuple for queryResolver compatibility
  async getVal(paramName) {
    try {
      // Check local cache first for performance
      if (this.parameters[paramName] !== undefined) {
        const value = this.parameters[paramName];
        return value !== null ? [`:${paramName}`, value] : null;
      }

      // Fetch from database via getVal SharedQuery
      const { email } = this.userInfo;
      const result = await execEvent(GET_VAL_XREF, {
        email,
        paramName
      });

      if (result && result[0]?.tuple) {
        // Parse tuple format "{:paramName,paramVal}"
        const tuple = result[0].tuple;
        const match = tuple.match(/\{:([^,]+),(.+)\}/);
        if (match) {
          const [, key, value] = match;
          // Cache locally for future calls
          this.parameters[paramName] = value;
          return [`:${key}`, value];
        }
      }

      return null;
    } catch (error) {
      log.error("Failed to get context parameter", { paramName, error });
      // Fallback to local cache
      const value = this.parameters[paramName];
      return value !== undefined ? [`:${paramName}`, value] : null;
    }
  }

  // Clear multiple parameters - database-driven
  async clearVals(...paramNames) {
    try {
      const { email, firstName } = this.userInfo;

      // Clear in database via clearVals SharedQuery
      await execEvent(CLEAR_VALS_XREF, {
        email,
        firstName,
        paramNames
      });

      // Clear local cache
      paramNames.forEach(name => {
        this.parameters[name] = null;
      });

      log.debug("Cleared parameters in database", { paramNames });
    } catch (error) {
      log.error("Failed to clear context parameters", { paramNames, error });
      // Still clear local cache on error
      paramNames.forEach(name => {
        this.parameters[name] = null;
      });
    }
  }

  // DELETED: Complex eventType-aware methods moved to WorkflowEngine
  // setEvent(), clearChildParams(), resolveParams(), getEventParams()
  // ContextStore is now a simple key-value store

  // Clear all contextual parameters
  clearAllContext() {
    this.parameters = {};
    log.debug("All context parameters cleared from cache");
    // Note: Database clearing would require separate implementation
    // or calling clearVals with all known parameter names
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
