import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import createLogger from '../utils/logger';

const log = createLogger('AuthStore');

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Core state
      currentUser: null,
      authenticated: false,
      accountList: [],
      
      // Actions
      setUserSession: (user, accounts = []) => {
        log('Setting user session', { user, accountCount: accounts.length });
        set({ 
          currentUser: user,
          authenticated: !!user && !!user.isAuthenticated,
          accountList: Array.isArray(accounts) ? accounts : []
        });
      },
      
      setAccountList: (accounts) => {
        if (!Array.isArray(accounts)) {
          log.warn('Invalid account list:', accounts);
          return;
        }
        log(`Setting account list: ${accounts.length} accounts`);
        set({ accountList: accounts });
      },
      
      loadUserAccountList: async () => {
        try {
          const { currentUser } = get();
          
          if (!currentUser || !currentUser.userID) {
            log.warn('Cannot load account list - no user logged in');
            return [];
          }
          
          // Import dynamically to avoid circular dependencies
          const { execEvent } = await import('./eventStore');
          const accounts = await execEvent('userAcctList');
          
          if (!Array.isArray(accounts)) {
            log.warn('Invalid account list response format:', accounts);
            return [];
          }
          
          // Update store state
          set({ accountList: accounts });
          return accounts;
        } catch (error) {
          log.error('Error loading user account list:', error);
          return [];
        }
      },
      
      logout: () => {
        log('Ending user session');
        set({ 
          currentUser: null, 
          authenticated: false, 
          accountList: [] 
        });
      },
      
      // Helper methods
      getCurrentUser: () => get().currentUser,
      isAuthenticated: () => get().authenticated
    }),
    {
      name: 'auth-storage', // storage key
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        authenticated: state.authenticated,
        accountList: state.accountList 
      })
    }
  )
);

// Export individual methods for backwards compatibility
export const getCurrentUser = () => useAuthStore.getState().currentUser;
export const isAuthenticated = () => useAuthStore.getState().authenticated;
export const getUserAccountList = () => useAuthStore.getState().accountList;
export const setUserSession = (user, accounts) => useAuthStore.getState().setUserSession(user, accounts);
export const loadUserAccountList = () => useAuthStore.getState().loadUserAccountList();
export const setUserAccountList = (accounts) => useAuthStore.getState().setAccountList(accounts);
export const endUserSession = () => useAuthStore.getState().logout();
