import { useEffect } from 'react';


/**
 * Hook to set page header properties
 * Simplified version - just sets document title for now
 * @param {Object} props Header properties  
 * @param {string} props.title Page title
 * @param {string} props.description Page description
 * @param {React.ComponentType} props.icon Icon component
 */
export const usePageHeader = ({ title, description, icon }) => {
  useEffect(() => {
    // Set browser document title
    if (title) {
      document.title = `${title} - WhatsFresh`;
    }
    
    // Note: With sidebar navigation, we may not need breadcrumbs/page headers
    // Remove navigationStore usage since sidebar handles navigation
    
  }, [title, description, icon]);
};

export default usePageHeader;


