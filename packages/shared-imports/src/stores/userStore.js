// userStore.js - Shared authentication store for user data only
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('UserStore');
const STORAGE_KEY = 'whatsfresh_user_session';

// Create context for React components
export const UserContext = React.createContext(null);

class UserStore {
  // User authentication data
  currentUser = null;
  isAuthenticated = false;
  
  // Default account assignment (persisted across sessions)
  defaultAcctID = null;
  
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedSession();
  }
  
  // Load full session state from localStorage
  loadPersistedSession() {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        const { currentUser, isAuthenticated, defaultAcctID } = JSON.parse(savedSession);
        
        if (currentUser && isAuthenticated) {
          this.currentUser = currentUser;
          this.isAuthenticated = isAuthenticated;
          this.defaultAcctID = defaultAcctID;
          log.debug('Restored session state', { 
            userID: currentUser.userID, 
            accountId: defaultAcctID 
          });
        } else if (defaultAcctID) {
          // Legacy: just account preference
          this.defaultAcctID = defaultAcctID;
          log.debug('Loaded persisted default account', { accountId: this.defaultAcctID });
        }
      }
    } catch (error) {
      log.error('Failed to load persisted session', error);
    }
  }
  
  // Save full session state to localStorage
  persistSession() {
    try {
      const stateToSave = {
        currentUser: this.currentUser,
        isAuthenticated: this.isAuthenticated,
        defaultAcctID: this.defaultAcctID
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      log.error('Failed to persist session', error);
    }
  }
  
  // Set user data on login (clean data, no passwords)
  setUserData(userData) {
    if (!userData) return;
    
    this.currentUser = {
      userID: userData.userID,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      roleID: userData.roleID,
      dfltAcctID: userData.dfltAcctID
    };
    
    this.isAuthenticated = true;
    
    // Set default account to user's assigned default if none set
    if (!this.defaultAcctID && userData.dfltAcctID) {
      this.defaultAcctID = userData.dfltAcctID;
    }
    
    // Persist full session state
    this.persistSession();
    
    log.debug('User data set', { 
      userID: userData.userID,
      defaultAcctID: this.defaultAcctID
    });
  }
  
  // Update default account (called when user selects different account)
  setDefaultAccount(accountId) {
    this.defaultAcctID = accountId;
    this.persistSession();
    log.debug('Default account updated', { accountId });
  }
  
  // Logout - clear auth data, but keep account assignment
  logout() {
    const { defaultAcctID } = this; // Keep assignment
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Restore assignment for next login but clear session
    this.defaultAcctID = defaultAcctID;
    this.persistSession();
    
    log.debug('Logged out, maintained account assignment', { accountId: defaultAcctID });
  }
  
  // Clear entire session (for complete logout)
  clearSession() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.defaultAcctID = null;
    
    localStorage.removeItem(STORAGE_KEY);
    log.debug('Session cleared completely');
  }
  
  // Computed properties
  get userDisplayName() {
    if (!this.currentUser) return 'Not logged in';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }
  
  get userID() {
    return this.currentUser?.userID || null;
  }
  
  get userDefaultAccountId() {
    return this.currentUser?.dfltAcctID || null;
  }
}

const userStore = new UserStore();

// Hook for functional components
export const useUserStore = () => {
  return userStore;
};

export default userStore;