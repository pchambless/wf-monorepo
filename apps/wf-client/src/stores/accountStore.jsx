// accountStore.js - Simplified MobX store focused on auth and account selection only
import { makeAutoObservable } from 'mobx';
import React from 'react';
import createLogger from '@whatsfresh/shared-imports';

const log = createLogger('AccountStore');
const STORAGE_KEY = 'whatsfresh_account_state';

// Create context for React components
export const AccountContext = React.createContext(null);

class AccountStore {
  // User authentication
  currentUser = null;
  isAuthenticated = false;
  
  // Account selection (persisted)
  currentAcctID = null;
  userAcctList = [];
  
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }
  
  // Load only account selection from localStorage
  loadPersistedState() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { currentAcctID } = JSON.parse(savedState);
        if (currentAcctID) this.currentAcctID = currentAcctID;
        log.debug('Loaded persisted account ID', { acctID: this.currentAcctID });
      }
    } catch (error) {
      log.error('Failed to load persisted state', error);
    }
  }
  
  // Save only account selection to localStorage
  persistState() {
    try {
      const stateToSave = { currentAcctID: this.currentAcctID };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      log.error('Failed to persist state', error);
    }
  }
  
  // Set user data and account list on login
  setUserLoginData(userData, accountList) {
    if (!userData) return;
    
    // Set clean user data (no passwords)
    this.currentUser = {
      userID: userData.userID,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      roleID: userData.roleID,
      dfltAcctID: userData.dfltAcctID
    };
    
    this.isAuthenticated = true;
    this.userAcctList = accountList || [];
    
    // Validate and set current account
    this.ensureValidAccountSelection();
    
    log.debug('User login data set', { 
      userID: userData.userID,
      acctCount: accountList?.length,
      acctID: this.currentAcctID
    });
  }
  
  // Ensure currentAcctID is valid with simple fallback logic
  ensureValidAccountSelection() {
    if (!this.userAcctList || this.userAcctList.length === 0) {
      log.warn('No accounts available for user');
      return;
    }
    
    const accountIds = this.userAcctList.map(acc => String(acc.acctID));
    const currentId = this.currentAcctID ? String(this.currentAcctID) : null;
    const defaultId = this.currentUser?.dfltAcctID ? String(this.currentUser.dfltAcctID) : null;
    
    // Check if current selection is still valid
    if (currentId && accountIds.includes(currentId)) {
      return; // Valid, keep it
    }
    
    // Try user's default account
    if (defaultId && accountIds.includes(defaultId)) {
      this.currentAcctID = this.currentUser.dfltAcctID;
    } else {
      // Fall back to first available account
      this.currentAcctID = this.userAcctList[0].acctID;
    }
    
    this.persistState();
    log.debug('Account selection updated', { acctID: this.currentAcctID });
  }
  
  // Change current account
  setCurrentAcctID(id) {
    this.currentAcctID = id;
    this.persistState();
    log.debug('Current account changed', { acctID: id });
  }
  
  // Simple logout - clear auth data, keep account preference
  logout() {
    const { currentAcctID } = this; // Keep account preference
    
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userAcctList = [];
    
    // Restore account preference for next login
    this.currentAcctID = currentAcctID;
    this.persistState();
    
    log.debug('Logged out, maintained account preference', { acctID: currentAcctID });
  }
  
  // Computed properties for easy access
  get userDisplayName() {
    if (!this.currentUser) return 'Not logged in';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }
  
  get currentAccount() {
    if (!this.currentAcctID || !this.userAcctList.length) return null;
    return this.userAcctList.find(acc => acc.acctID === this.currentAcctID) || null;
  }
}

const accountStore = new AccountStore();

// Hook for functional components
export const useAccountStore = () => {
  return accountStore;
};

export default accountStore;