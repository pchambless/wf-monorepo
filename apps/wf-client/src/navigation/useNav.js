import { useMemo } from 'react';
import { useAccountStore } from '@stores/accountStore';
// Change from buildNavigation to navigationConfig
import { buildNavigation } from './config';

/**
 * Custom hook for accessing navigation data
 * @returns {Object} Navigation data and helper methods
 */
export const useNav = () => {
  // Get current account from store
  const { currentAccount } = useAccountStore();
  const accountId = currentAccount?.id || '';

  // Build navigation structure based on current account
  const navigation = useMemo(() => {
    return buildNavigation(accountId);
  }, [accountId]);

  // Active section detection
  const getActiveSection = (pathname) => {
    // Find which section contains the current route
    return navigation.find(section => 
      pathname === section.path || 
      (section.children?.some(item => pathname === item.path))
    );
  };

  return {
    navigation,           // Full navigation structure for sidebar
    accountId,            // Current account ID for convenience
    getActiveSection,     // Helper to find active section based on URL
    
    // Method to check if a nav item is active
    isActive: (path) => {
      const pathname = window.location.pathname;
      return pathname === path;
    }
  };
};
