import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dataStore from '@stores/dataStore';
import accountStore from '@stores/accountStore';
import createLogger from '@utils/logger';
import { modalStore } from '@modal';

const log = createLogger('useCrudActions');

/**
 * Custom hook to handle CRUD actions and button visibility
 * 
 * @param {Object} pageMap - The page configuration
 * @param {React.RefObject} formRef - Reference to the form component
 * @returns {Object} Action handlers and visibility flags
 */
const useCrudActions = (pageMap, formRef) => {
  const { pageConfig } = pageMap || {};
  const navigate = useNavigate();
  
  // Determine which buttons should be visible
  const canAdd = !!pageConfig?.canAdd !== false; // Default to true unless explicitly false
  const canEdit = !!pageConfig?.canEdit !== false; // Default to true unless explicitly false 
  const canDelete = !!pageConfig?.canDelete !== false; // Default to true unless explicitly false
  const canSelect = !!pageConfig?.canSelect !== false; // Default to true unless explicitly false
  
  // Log the visibility state for debugging
  log.debug('Action visibility state:', { 
    canAdd, canEdit, canDelete, canSelect,
    pageMapId: pageMap?.id
  });
  
  // Handle row selection
  const handleRowSelect = useCallback((params) => {
    const row = params.row;
    if (!row) return;
    
    dataStore.selectRow(row);
    dataStore.setFormMode('UPDATE');
    
    // Store entity selection in accountStore
    if (pageConfig?.idField) {
      const entityType = pageConfig.idField;
      const entityId = row[entityType];
      log.debug('Setting selected entity', { entityType, entityId });
      accountStore.setSelectedEntity(entityType, entityId);
    }
    
    if (formRef.current) {
      formRef.current.refresh('UPDATE', row);
    }
  }, [pageConfig, formRef]);
  
  // Handle adding new items
  const handleAddNew = useCallback(() => {
    log.debug('Add New button clicked');
    
    if (formRef.current) {
      formRef.current.refresh('INSERT', {});
      
      // Set parent ID for hierarchical data
      const parentIdField = pageMap.pageConfig?.parentIdField;
      const parentId = dataStore.getParentId();
      
      if (parentIdField && parentId) {
        formRef.current.setParentId(parentId);
        log.info(`Set parent ID: ${parentIdField}=${parentId}`);
      } else {
        log.warn('Missing parent ID for new record');
      }
    }
  }, [pageMap, formRef]);
  
  // Handle deleting items
  const handleDelete = useCallback((row) => {
    if (!row) return;
    
    const idField = pageConfig?.idField || 'id';
    const id = row[idField];
    const entityName = pageConfig?.entityName || 'item';
    
    modalStore.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${entityName}?`,
      onConfirm: () => {
        dataStore.deleteRow(id);
      }
    });
  }, [pageConfig]);
  
  // Handle navigation actions
  const handleNavigation = useCallback((row, action) => {
    if (!row || !action || !action.route || !action.paramField) return;
    
    const paramValue = row[action.paramField];
    if (paramValue) {
      const route = action.route.replace(`:${action.paramField}`, paramValue);
      log.info(`Navigating to: ${route}`);
      navigate(route);
    }
  }, [navigate]);
  
  return {
    // Action handlers
    handleRowSelect,
    handleAddNew,
    handleDelete,
    handleNavigation,
    
    // Visibility flags
    canAdd,
    canEdit, 
    canDelete,
    canSelect
  };
};

export default useCrudActions;
