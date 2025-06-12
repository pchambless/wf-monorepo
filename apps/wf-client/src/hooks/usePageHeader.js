import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import navigationStore from '@stores/navigationStore';

/**
 * Hook to set page header properties
 * @param {Object} props Header properties
 * @param {string} props.title Page title
 * @param {string} props.description Page description
 * @param {React.ComponentType} props.icon Icon component
 */
export const usePageHeader = ({ title, description, icon }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Set page title in navigation store
    if (title) {
      navigationStore.setPageTitle(title);
    }
    
    // Set breadcrumbs based on current location
    // This will need to be customized based on your app structure
    navigationStore.setBreadcrumbs([
      { label: 'Dashboard', path: '/' },
      // Add additional breadcrumbs based on location if needed
    ]);
    
  }, [title, description, icon, location.pathname]);
};

export default usePageHeader;


