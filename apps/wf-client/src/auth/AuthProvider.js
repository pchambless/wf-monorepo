import React, { createContext, useState, useEffect } from 'react';
import { registerActionHandlers } from '../actions/actionHandlers';
import createLogger from '../utils/logger';

const log = createLogger('AuthProvider');
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionHandlerUnsubscribers, setActionHandlerUnsubscribers] = useState([]);

  // Initialize auth state from storage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Register action handlers when user is authenticated
          const unsubscribers = registerActionHandlers({
            executeHandlers: true,
            logOnly: false
          });
          setActionHandlerUnsubscribers(unsubscribers);
          log.info('Action handlers registered');
        }
      } catch (error) {
        log.error('Error restoring authentication state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    // Your existing login logic
    // ...

    // After successful login:
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Register action handlers on login
    const unsubscribers = registerActionHandlers({
      executeHandlers: true,
      logOnly: false
    });
    setActionHandlerUnsubscribers(unsubscribers);
    log.info('Action handlers registered after login');
  };

  const logout = () => {
    // Cleanup action handlers on logout
    actionHandlerUnsubscribers.forEach(unsub => unsub());
    setActionHandlerUnsubscribers([]);
    log.info('Action handlers unregistered');
    
    // Your existing logout logic
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Define auth context value
  const authContextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
