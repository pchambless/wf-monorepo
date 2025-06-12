import createLogger from '../../../utils/logger';
import accountStore from '../../../stores/accountStore';
import navigationStore from '../../../stores/navigationStore';
import { 
  execEvent,
  initEventTypeService,
  isEventTypeServiceInitialized  // Add this import
} from '../../../stores';

export class LoginPresenter {
  constructor() {
    this.log = createLogger('Login');
  }

  async initEventTypes() {
    try {
      this.log.info('Initializing event types');
      const success = await initEventTypeService();
      
      if (!success) {
        throw new Error('Failed to initialize event types');
      }
      
      this.log.info('Event types initialized successfully');
      return true;
    } catch (error) {
      this.log.error('Error initializing event types:', error);
      throw error;
    }
  }

  async initApplicationState(user, accounts) {
    try {
      // Set up navigation first
      navigationStore.setPageTitle("WhatsFresh");
      
      // Update account store with user data - this replaces setVars
      accountStore.setUserData(user);
      accountStore.setUserAcctList(accounts);
      
      // Load reference data
      await this.loadReferenceData();
      
      return true;
    } catch (error) {
      this.log.error('Error initializing application state:', error);
      throw error;
    }
  }
  
  async loadReferenceData() {
    try {
      if (!accountStore.currentAcctID) {
        throw new Error('No account ID available for loading reference data');
      }
      
      // Load account-specific reference data
      const acctID = accountStore.currentAcctID;
      
      const [
        ingrTypes, 
        prodTypes,
        measures,
        brands,
        vendors,
        workers
      ] = await Promise.all([
        execEvent('ingrTypeList', { ':acctID': acctID }),
        execEvent('prodTypeList', { ':acctID': acctID }),
        execEvent('measList', { ':acctID': acctID }),
        execEvent('brndList', { ':acctID': acctID }),
        execEvent('vndrList', { ':acctID': acctID }),
        execEvent('wrkrList', { ':acctID': acctID })
      ]);
      
      // Update store with results
      accountStore.setIngrTypeList(ingrTypes);
      accountStore.setProdTypeList(prodTypes);
      accountStore.setMeasList(measures);
      accountStore.setBrndList(brands);
      accountStore.setVndrList(vendors);
      accountStore.setWrkrList(workers);
      
      this.log.info('Reference data loaded successfully');
      return true;
    } catch (error) {
      this.log.error('Failed to load reference data', error);
      throw error;
    }
  }

  async handleLogin(credentials) {
    this.log.info('Login attempt started', { email: credentials.email });
    try {
      // Initialize event types first if needed
      if (!isEventTypeServiceInitialized()) {
        this.log.info('Initializing event types before login');
        await this.initEventTypes();
      }
      
      this.log.info('Sending login request...');
      
      // Using direct params for credential passing
      const result = await execEvent('userLogin', {
        ':userEmail': credentials.email,
        ':enteredPassword': credentials.password
      });
      
      // Sanitize sensitive data before logging
      const sanitizedResult = Array.isArray(result) 
        ? result.map(user => {
            const { myEnteredPassword: _myEnteredPassword, password: _password, ...safeData } = user;
            return safeData;
          })
        : result;
      this.log.info('Login response received', { sanitizedResult });
      
      // Extract user data from the result - add more logging
      let userData;
      if (Array.isArray(result) && result.length > 0) {
        userData = result[0];
        this.log.info('User data extracted from array result', { userId: userData.userID });
      } else if (result && typeof result === 'object') {
        userData = result;
        this.log.info('User data extracted from object result', { userId: userData.userID });
      } else {
        this.log.error('Invalid login response format', { result: JSON.stringify(result) });
        throw new Error('Invalid login response format');
      }
      
      // Load accounts
      this.log.info('Loading user accounts', { userID: userData.userID });
      const accounts = await execEvent('userAcctList', { 
        ':userID': userData.userID 
      });
      this.log.info('User accounts loaded', { count: accounts.length });
      
      // Initialize the application state
      this.log.info('Initializing application state');
      const stateInitialized = await this.initApplicationState(userData, accounts);
      this.log.info('Application state initialized', { success: stateInitialized });
      
      return result;
    } catch (error) {
      this.log.error('Login failed:', error);
      throw error;
    }
  }
}
