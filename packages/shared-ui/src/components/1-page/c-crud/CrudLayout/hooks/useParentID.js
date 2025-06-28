import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dataStore from '@stores/dataStore';
import createLogger from '@utils/logger';

const log = createLogger('useParentID');

/**
 * Hook to manage parent ID for hierarchical data
 * 
 * @param {Object} pageMap - The pageMap configuration object
 * @returns {Object} Parent ID state and utility functions
 */
const useParentID = (pageMap) => {
  const params = useParams();
  const [parentId, setParentId] = useState(null);
  const { pageConfig } = pageMap || {};
  const parentIdField = pageConfig?.parentIdField;
  const listEvent = pageConfig?.listEvent;
  const isChildEntity = !!parentIdField;
  
  // Extract and manage parent ID
  useEffect(() => {
    if (!isChildEntity) {
      // This is a root entity, no parent ID needed
      log.debug('This is a root entity, no parent ID required');
      return;
    }
    
    // Skip for specific listEvents that don't need parent IDs
    if (listEvent === 'measList') {
      log.debug('Skipping parent ID for measList event');
      return;
    }
    
    // Try to get parent ID from URL parameters
    const urlParentId = params[parentIdField];
    
    if (urlParentId) {
      // URL parameter takes highest precedence
      log.info(`Setting parent ID from URL: ${parentIdField}=${urlParentId}`);
      dataStore.setParentId(urlParentId);
      setParentId(urlParentId);
    } else {
      // Try to get from dataStore or session storage
      const storedParentId = dataStore.getParentId();
      
      if (storedParentId) {
        log.info(`Using stored parent ID: ${parentIdField}=${storedParentId}`);
        setParentId(storedParentId);
      } else {
        // Instead of defaulting to account ID 1, show error for missing parent ID
        log.error(`Missing required parent ID for ${parentIdField} - operation blocked for security`);
        setParentId(null);
        
        // You could also trigger an error notification here
        // modalStore.showError(`Security Error: Missing required account context. Please contact support.`);
        
        // For development only - you can keep a commented version of the special case
        // if (process.env.NODE_ENV === 'development') {
        //   console.warn('DEV MODE ONLY: Would use default account ID for testing');
        // }
      }
    }
  }, [pageMap, params, parentIdField, listEvent, isChildEntity]);
  
  // Debugging: Log the sources of parent ID
  useEffect(() => {
    log.info('=== PARENT ID SOURCES ===');
    console.log('URL Params:', params);
    console.log('From Store:', dataStore.getParentId());
    console.log('========================');
  }, [pageMap, params]);
  
  /**
   * Set a new parent ID for the current context
   */
  const updateParentId = (newParentId) => {
    if (newParentId && isChildEntity) {
      dataStore.setParentId(newParentId);
      setParentId(newParentId);
      log.info(`Parent ID updated: ${parentIdField}=${newParentId}`);
      return true;
    }
    return false;
  };
  
  /**
   * Clear the current parent ID
   */
  const clearParentId = () => {
    dataStore.setParentId(null);
    setParentId(null);
    log.info('Parent ID cleared');
  };
  
  return {
    parentId,
    parentIdField,
    isChildEntity,
    updateParentId,
    clearParentId,
    
    // Derived values for convenience
    hasParentId: !!parentId,
    requiresParentId: isChildEntity && pageConfig?.listEvent !== 'measList'
  };
};

export default useParentID;
