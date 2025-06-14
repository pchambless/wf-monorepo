import accountStore from '../stores/accountStore';
import createLogger from '../utils/logger';

const log = createLogger('AccountService');

/**
 * Service to manage account selection and initialization
 * - Works for both initial login and subsequent account changes
 * - Provides consistent behavior and error handling
 */
class AccountService {
  /**
   * Initialize account after login
   * @param {Object} userData User data from login response
   * @param {Array} accountList User's available accounts
   * @returns {Boolean} Success indicator
   */
  async initializeAfterLogin(userData, accountList) {
    try {
      log.info('Initializing account after login', { 
        userId: userData?.userID,
        accountCount: accountList?.length || 0
      });
      
      // Set user data
      accountStore.setUserData(userData);
      accountStore.setUserAcctList(accountList);
      
      // Ensure valid account is selected
      accountStore.ensureValidAccountSelection();
      
      // Load reference data for the selected account
      await accountStore.loadAllReferenceData();
      
      return true;
    } catch (error) {
      log.error('Error initializing after login:', error);
      return false;
    }
  }
  
  /**
   * Switch to a different account
   * @param {string|number} accountId ID of account to switch to
   * @param {function} navigate Navigation function (optional)
   * @returns {Promise<boolean>} Success indicator
   */
  async switchAccount(accountId, navigate = null) {
    try {
      log.info('Switching account', { accountId });
      
      // Validate account ID
      if (!this._isValidAccountId(accountId)) {
        log.error('Invalid account ID:', accountId);
        return false;
      }
      
      // Update current account
      accountStore.setCurrentAcctID(accountId);
      
      // Re-initialize any account-specific data
      await accountStore.loadAllReferenceData();
      
      // Navigate if requested
      if (navigate) {
        log.info('Navigating to dashboard');
        navigate('/dashboard');
      }
      
      return true;
    } catch (error) {
      log.error('Error switching accounts:', error);
      return false;
    }
  }
  
  /**
   * Check if account exists in account list
   * @private
   */
  _isValidAccountId(accountId, accountList = null) {
    if (!accountId) return false;
    
    // Use provided account list or get from store
    const accounts = accountList || accountStore.userAcctList;
    
    if (!accounts || accounts.length === 0) {
      log.warn('No accounts available to validate against');
      return false;
    }
    
    // Convert IDs to strings for consistent comparison
    const idToFind = String(accountId);
    const exists = accounts.some(acct => String(acct.acctID) === idToFind);
    
    if (!exists) {
      log.warn('Account ID not found in account list', { 
        accountId, 
        availableIds: accounts.map(a => a.acctID)
      });
    }
    
    return exists;
  }
}

// Create singleton instance
const accountService = new AccountService();
export default accountService;
