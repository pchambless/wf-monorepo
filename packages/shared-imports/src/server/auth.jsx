/**
 * Authentication utilities for WhatsFresh applications
 * @module auth
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@whatsfresh/shared-imports/api';
import { eventTypes } from '@whatsfresh/shared-imports/events';

// Create auth context
const AuthContext = createContext(null);

/**
 * Authentication provider component
 */
export function AuthProvider({
  children,
  apiInstance = api,
  eventService = eventTypes,
  requireAdminRole = false, // Set to true in admin app only
  onLoginSuccess = () => { },
  onLogout = () => { }
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize events if not already
        await eventService.initialize();

        // Check for stored user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [eventService]);

  /**
   * Log in user with optional admin role validation
   */
  async function login(email, password) {
    try {
      setLoading(true);
      setError(null);

      const userData = await apiInstance.execEvent('userLogin', {
        ':userEmail': email,
        ':enteredPassword': password
      });

      if (!userData || userData.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = userData[0];

      // Check for admin role if required
      if (requireAdminRole && user.roleID !== 1) {
        throw new Error('You do not have administrator access');
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      // Call success callback
      onLoginSuccess(user);

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Log out user
   */
  function logout() {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    onLogout();
  }

  // Auth context value
  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * React hook for using auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}