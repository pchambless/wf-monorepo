import { 
  createLogger,
  execEvent,
  initEventTypeService,
  isEventTypeServiceInitialized,
  contextStore
} from '@whatsfresh/shared-imports';

export class LoginPresenter {
  constructor() {
    this.log = createLogger('LoginPresenter');
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
      // Store all user data in contextStore
      contextStore.setParameter('userID', user.userID);
      contextStore.setParameter('firstName', user.firstName);
      contextStore.setParameter('lastName', user.lastName);
      contextStore.setParameter('userEmail', user.userEmail);
      contextStore.setParameter('roleID', user.roleID);
      contextStore.setParameter('dfltAcctID', user.dfltAcctID);
      // Mark session as valid after successful login
      contextStore.setParameter('sessionValid', true);
      
      this.log.info('User authentication data initialized in contextStore');
      return true;
    } catch (error) {
      this.log.error('Error initializing application state:', error);
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
      // Server will automatically detect app type via headers for role validation
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
      
      // Extract user data from the result
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
      
      // Store user data in contextStore first
      this.log.info('Initializing application state');
      const success = await this.initApplicationState(userData, []);
      
      // Load accounts (execEvent will now auto-resolve userID from contextStore)
      this.log.info('Loading user accounts', { userID: userData.userID });
      const accounts = await execEvent('userAcctList');
      this.log.info('User accounts loaded', { count: accounts.length });
      this.log.info('Application state initialized', { success });
      
      return result;
    } catch (error) {
      this.log.error('Login failed:', error);
      throw error;
    }
  }
}