// accountStore.js - Clean MobX implementation with correct naming
import { makeAutoObservable } from 'mobx';
import React from 'react';
import createLogger from '@utils/logger';
import { execEvent } from './eventStore';

const log = createLogger('AccountStore');
const STORAGE_KEY = 'whatsfresh_account_state';

// Create context for React components
export const AccountContext = React.createContext(null);

class AccountStore {
  // User data
  currentUser = null;
  isAuthenticated = false;
  
  // Account selection
  currentAcctID = null;
  userAcctList = [];
  
  // Reference data lists
  ingrTypeList = [];
  prodTypeList = [];
  measList = [];
  brndList = [];
  vndrList = [];
  wrkrList = [];
  
  // Entity selections for navigation
  entitySelections = {};
  
  constructor() {
    makeAutoObservable(this);
    this.loadPersistedState();
  }
  
  // Load saved state from localStorage
  loadPersistedState() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const { currentAcctID, entitySelections } = JSON.parse(savedState);
        
        if (currentAcctID) this.currentAcctID = currentAcctID;
        if (entitySelections) this.entitySelections = entitySelections;
        
        log.debug('Loaded persisted account state', { acctID: this.currentAcctID });
      }
    } catch (error) {
      log.error('Failed to load persisted state', error);
    }
  }
  
  // Save state to localStorage
  persistState() {
    try {
      const stateToSave = {
        currentAcctID: this.currentAcctID,
        entitySelections: this.entitySelections
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      log.error('Failed to persist state', error);
    }
  }
  
  // Initialize user data from login
  setUserData(userData) {
    if (!userData) return;
    
    this.currentUser = userData;
    this.isAuthenticated = true;
    
    // If first login, set account ID from default
    if (!this.currentAcctID && userData.dfltAcctID) {
      this.currentAcctID = userData.dfltAcctID;
      this.persistState();
    }
    
    log.debug('User data set', { 
      userID: userData.userID,
      acctID: this.currentAcctID
    });
  }
  
  // Set user data and account list together to ensure proper validation
  setUserLoginData(userData, accountList) {
    if (!userData) return;
    
    this.currentUser = {
      userID: userData.userID,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userEmail: userData.userEmail,
      roleID: userData.roleID,
      dfltAcctID: userData.dfltAcctID
      // Explicitly exclude password and lastLogin
    };
    
    this.isAuthenticated = true;
    this.userAcctList = accountList || [];
    
    // Now validate and set currentAcctID
    this.ensureValidAccountSelection();
    
    log.debug('User login data set', { 
      userID: userData.userID,
      acctCount: accountList?.length,
      acctID: this.currentAcctID
    });
  }
  
  // Set account list
  setUserAcctList(accounts) {
    this.userAcctList = accounts || [];
    // Validate selection whenever account list changes
    this.ensureValidAccountSelection();
  }
  
  // Ensure currentAcctID is valid, with fallbacks
  ensureValidAccountSelection() {
    if (!this.userAcctList || this.userAcctList.length === 0) {
      log.warn('No accounts available for user');
      return;
    }
    
    // Convert IDs to strings for consistency in comparison
    const accountIds = this.userAcctList.map(acc => String(acc.acctID));
    const currentId = this.currentAcctID ? String(this.currentAcctID) : null;
    const defaultId = this.currentUser?.dfltAcctID ? String(this.currentUser.dfltAcctID) : null;
    
    log.debug('Validating account selection', { 
      currentId, 
      defaultId, 
      availableIds: accountIds 
    });
    
    // Check if current selection is valid
    if (currentId && accountIds.includes(currentId)) {
      log.info('Using persisted account selection', { acctID: currentId });
      return; // Current selection is valid
    }
    
    // Try default from user data
    if (defaultId && accountIds.includes(defaultId)) {
      log.info('Using default account from user data', { acctID: defaultId });
      this.currentAcctID = this.currentUser.dfltAcctID;
    } else {
      // Fall back to first account
      log.info('Using first available account', { acctID: this.userAcctList[0].acctID });
      this.currentAcctID = this.userAcctList[0].acctID;
    }
    
    this.persistState();
  }
  
  // Change current account
  setCurrentAcctID(id) {
    this.currentAcctID = id;
    this.entitySelections = {}; // Clear selections when changing accounts
    this.persistState();
    
    log.debug('Current account changed', { acctID: id });
  }
  
  // Track entity selection with persistence
  setSelectedEntity(entityType, id) {
    this.entitySelections[entityType] = id;
    this.persistState();
    
    log.debug('Entity selected', { entityType, id });
  }
  
  // Get a selected entity by type
  getSelectedEntity(entityType) {
    return this.entitySelections?.[entityType] || null;
  }
  
  // Logout - clear sensitive data
  logout() {
    // Keep persisted data
    const { currentAcctID } = this;
    
    // Clear everything else
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userAcctList = [];
    this.ingrTypeList = [];
    this.prodTypeList = [];
    this.measList = [];
    this.brndList = [];
    this.vndrList = [];
    this.wrkrList = [];
    this.entitySelections = {};
    
    // Restore persisted account ID
    this.currentAcctID = currentAcctID;
    this.persistState();
    
    log.debug('Logged out, maintained acctID', { acctID: currentAcctID });
  }
  
  // Set reference data
  setIngrTypeList(data) { this.ingrTypeList = data || []; }
  setProdTypeList(data) { this.prodTypeList = data || []; }
  setMeasList(data) { this.measList = data || []; }
  setBrndList(data) { this.brndList = data || []; }
  setVndrList(data) { this.vndrList = data || []; }
  setWrkrList(data) { this.wrkrList = data || []; }
  
  // Load all reference data for an account
  async loadAllReferenceData(acctID) {
    try {
      const acctIdToUse = acctID || this.currentAcctID;
      if (!acctIdToUse) {
        log.error('Cannot load reference data: No account ID');
        return false;
      }
      
      log.info('Loading reference data for account', { acctID: acctIdToUse });
      
      // Load each reference list (using your existing event execution)
      const [ingrTypeList, prodTypeList, measList, brndList, vndrList, wrkrList] = await Promise.all([
        execEvent('ingrTypeList', { ':acctID': acctIdToUse }),
        execEvent('prodTypeList', { ':acctID': acctIdToUse }),
        execEvent('measList', { ':acctID': acctIdToUse }),
        execEvent('brndList', { ':acctID': acctIdToUse }),
        execEvent('vndrList', { ':acctID': acctIdToUse }),
        execEvent('wrkrList', { ':acctID': acctIdToUse })
      ]);
      
      // Update store in one batch - CORRECTED NAMING
      this.setReferenceData({
        ingrTypeList, 
        prodTypeList, 
        measList, 
        brndList, 
        vndrList, 
        wrkrList
      });
      
      log.info('Reference data loaded successfully');
      return true;
    } catch (error) {
      log.error('Failed to load reference data', error);
      return false;
    }
  }

  // Update all reference lists at once (batch update)
  setReferenceData({ ingrTypeList, prodTypeList, measList, brndList, vndrList, wrkrList }) {
    if (ingrTypeList) this.setIngrTypeList(ingrTypeList);
    if (prodTypeList) this.setProdTypeList(prodTypeList);
    if (measList) this.setMeasList(measList);
    if (brndList) this.setBrndList(brndList);
    if (vndrList) this.setVndrList(vndrList);
    if (wrkrList) this.setWrkrList(wrkrList);
  }
}

const accountStore = new AccountStore();

// Hook for functional components to use accountStore
export const useAccountStore = () => {
  // If store hasn't been initialized yet, provide default values
  if (!accountStore) {
    return {
      isAuthenticated: false,
      isLoading: true,
      currentAccount: null,
      currentAcctID: null
    };
  }
  return accountStore;
};

export default accountStore;
