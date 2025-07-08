// userStore.js - Shared authentication store for user data only
import { makeAutoObservable } from 'mobx';
import React from 'react';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('UserStore');
const STORAGE_KEY = 'whatsfresh_user_preference';

// Create context for React components
export const UserContext = React.createContext(null);

class UserStore {
  // User authentication data only
  currentUser = null;
  isAuthenticated = false;
  
  // Default account assignment (persisted across sessions)
  defaultAcctID = null;
  
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedPreference();
  }
  
  // Load only account preference from localStorage
  loadPersistedPreference() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { defaultAcctID } = JSON.parse(savedState);
        if (defaultAcctID) this.defaultAcctID = defaultAcctID;
        log.debug('Loaded persisted default account', { accountId: this.defaultAcctID });
      }
    } catch (error) {
      log.error('Failed to load persisted preference', error);
    }
  }
  
  // Save only account preference to localStorage
  persistPreference() {
    try {
      const stateToSave = { defaultAcctID: this.defaultAcctID };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      log.error('Failed to persist preference', error);
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
      this.persistPreference();
    }
    
    log.debug('User data set', { 
      userID: userData.userID,
      defaultAcctID: this.defaultAcctID
    });
  }
  
  // Update default account (called when user selects different account)
  setDefaultAccount(accountId) {
    this.defaultAcctID = accountId;
    this.persistPreference();
    log.debug('Default account updated', { accountId });
  }
  
  // Logout - clear auth data, keep account assignment
  logout() {
    const { defaultAcctID } = this; // Keep assignment
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Restore assignment for next login
    this.defaultAcctID = defaultAcctID;
    this.persistPreference();
    
    log.debug('Logged out, maintained account assignment', { accountId: defaultAcctID });
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