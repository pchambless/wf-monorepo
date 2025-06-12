import { useState } from 'react';
import { setVars, getVar, clearAllVars } from '../utils/externalStoreDel';
import createLogger from '../utils/logger';

const log = createLogger('SessionStore');

// Private state
let currentUser = null;
let authenticated = false;
let accountList = [];

// Store keys
const AUTH_USER = ':session.user';
const AUTH_STATE = ':session.authenticated';
const USER_ACCT_LIST = ':session.accountList';

/**
 * Set user session data
 * @param {object} user - User data
 * @param {array} [userAccounts] - Optional list of accounts the user has access to
 */
export const setUserSession = async (user, userAccounts = []) => {
  log('Setting user session', { user, accountCount: userAccounts.length });
  
  // Update local state
  currentUser = user;
  authenticated = !!user && !!user.isAuthenticated;
  
  if (userAccounts && Array.isArray(userAccounts)) {
    accountList = userAccounts;
  }
  
  // Update external store
  setVars({
    [AUTH_USER]: user,
    [AUTH_STATE]: authenticated ? "1" : "0",
    [USER_ACCT_LIST]: accountList
  });

  // Don't initialize accountStore here - it will be done when needed
};

/**
 * Get current user data
 * @returns {object|null} Current user data
 */
export const getCurrentUser = () => currentUser;

/**
 * Get user account list
 * @returns {array} List of accounts the user has access to
 */
export const getUserAccountList = () => accountList;

/**
 * Set the user account list
 * @param {array} accounts - List of accounts the user has access to
 */
export const setUserAccountList = (accounts) => {
  if (!Array.isArray(accounts)) {
    log.warn('Invalid account list:', accounts);
    return;
  }
  
  log(`load userAcctList: ${accounts.length} accounts`);
  accountList = accounts;
  setVars({ [USER_ACCT_LIST]: accounts });
};

/**
 * Load the account list for the current user
 * @returns {Promise<Array>} The list of user accounts
 */
export const loadUserAccountList = async () => {
  try {
    const user = getCurrentUser();
    log('load UserAcctList called:', { user });
    
    if (!user || !user.userID) {
      log.warn('Cannot load account list - no user logged in');
      log('DEBUGGING - No user found in loadUserAccountList');
      return [];
    }
    
    log(`Loading account list for user ${user.userID}`);
    
    // Use the eventStore directly
    const { execEvent } = require('./eventStore');
    
    // Make sure the event name is correct - it might be 'userAcctList' or something else
    log('Call execEvent for userAcctList');
    const accounts = await execEvent('userAcctList');
    log('execEvent response:', accounts);
    
    if (!Array.isArray(accounts)) {
      log.warn('Invalid account list response format:', accounts);
      log('Invalid account response format:', accounts);
      return [];
    }
    
    log(`Loaded ${accounts.length} accounts for user ${user.userID}`);
    
    // Update the account list in the store
    setUserAccountList(accounts);
    
    return accounts;
  } catch (error) {
    log.error('Error loading user account list:', error);
    return [];
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication state
 */
export const isAuthenticated = () => authenticated;

/**
 * End user session (logout)
 */
export const endUserSession = () => {
  log('Ending user session');
  
  // Clear local state
  currentUser = null;
  authenticated = false;
  accountList = [];
  
  // Update external store
  setVars({
    [AUTH_USER]: null,
    [AUTH_STATE]: "0",
    [USER_ACCT_LIST]: []
  });
};

/**
 * Initialize session store
 * @returns {Promise<boolean>} Success status
 */
export const initSessionStore = async () => {
  log('Initializing session store');
  
  try {
    // If authenticated but no account list, load it
    if (authenticated && (accountList.length === 0)) {
      log('Loading user account list as part of session store initialization');
      await loadUserAccountList();
    } else if (!authenticated) {
      log('Cannot load account list - user not authenticated');
    } else {
      log('Account list already loaded - skipping');
    }
    
    // Add any other session initialization tasks here
    
    return true;
  } catch (error) {
    log.error('Error initializing session store:', error);
    return false;
  }
};

/**
 * React hook for using session data in components
 * @returns {object} Session state and methods
 */
export const useSessionStore = () => {
  const [state] = useState(() => ({
    user: getVar(AUTH_USER),
    authenticated: getVar(AUTH_STATE) === "1",
    accountList: getVar(USER_ACCT_LIST) || []
  }));

  const endUserSession = () => {
    log.debug('Ending user session');
    clearAllVars();  // Use clearAllVars instead of individual setVars
  };

  return {
    ...state,
    endUserSession
  };
};

// Initialize store
(() => {
  const storedUser = getVar(AUTH_USER);
  if (storedUser === undefined) {
    log.debug('Initializing session store with default values');
    setVars({
      [AUTH_USER]: null,
      [AUTH_STATE]: "0",
      [USER_ACCT_LIST]: []
    });
  } else {
    log.debug('Restoring session from external store');
    currentUser = storedUser;
    authenticated = getVar(AUTH_STATE) === "1";
    accountList = getVar(USER_ACCT_LIST) || [];
  }
})();
