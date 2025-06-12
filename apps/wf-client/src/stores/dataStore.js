// src/stores/dataStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import createLogger from '@utils/logger';
import { execEvent } from '@stores/eventStore';
import accountStore from '@stores/accountStore';
// Import all pageMap files
import * as pageMapCollection from '@whatsfresh/shared-config/src/pageMap';

/**
 * DataStore Class - handles all data operations for CRUD interfaces
 */
class DataStore {
  // Core state
  tableData = [];
  selectedRow = null;
  formMode = 'SELECT'; // Using SQL modes consistently
  isLoading = false;
  error = null;
  
  constructor() {
    // Create logger first
    this.log = createLogger('DataStore');
    
    // Make observable
    makeAutoObservable(this);
  }
  
  /**
   * The SINGLE source of truth for data fetching - now with automatic pageMap lookup
   */
  async fetchData(listEvent) {
    if (!listEvent) {
      this.log.warn('No listEvent provided');
      return [];
    }
    
    // Extract entity name from event (e.g., "ingrTypeList" from "ingrTypeListLoad")
    const entityName = listEvent.replace(/Load$|Save$|Insert$|Update$|Delete$/i, '');
    
    // Get pageMap directly from collection
    const pageMap = pageMapCollection[entityName];
    if (!pageMap) {
      this.log.warn(`No pageMap found for entity "${entityName}" derived from event "${listEvent}"`);
      return [];
    }
    
    this.log.debug(`Fetching data using ${listEvent} with ${pageMap.id} pageMap`);
    this.isLoading = true;
    this.error = null;
    
    try {
      // Get parameters from pageMap configuration
      const params = this.buildListParameters(pageMap);
      
      this.log.debug('Executing list event with params:', params);
      
      // Execute the event to get data
      const result = await execEvent(listEvent, params);
      
      // Update state with the fetched data
      runInAction(() => {
        this.tableData = Array.isArray(result) ? result : [];
        this.isLoading = false;
      });
      
      this.log.debug(`Fetched ${this.tableData.length} records`);
      return this.tableData;
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Failed to fetch data';
        this.isLoading = false;
        this.tableData = [];
      });
      
      this.log.error('Error fetching data:', error);
      return [];
    }
  }
  
  /**
   * Build parameters for list query based on pageMap
   */
  buildListParameters(pageMap) {
    if (!pageMap) return {};
    
    const params = {};
    
    // Handle parent-child relationship if specified
    if (pageMap.parentIdField) {
      const parentField = pageMap.parentIdField;
      
      // Get value from current selections in accountStore
      const parentValue = accountStore.getSelectedEntity(parentField);
      
      if (parentValue) {
        params[parentField] = parentValue;
        this.log.debug('Added parent filter:', { field: parentField, value: parentValue });  
      } else {
        this.log.debug('Parent field has no selected value:', { field: parentField });
      }
    }
    
    return params;
  }
  
  /**
   * Select a row for editing/viewing
   */
  selectRow(row) {
    this.log.debug('Selected row:', row);
    this.selectedRow = row;
    
    // Also update the form mode to indicate editing
    if (row) {
      this.formMode = 'UPDATE';
    } else {
      this.formMode = 'SELECT';
    }
  }
  
  /**
   * Clear the selected row
   */
  clearSelectedRow() {
    this.selectedRow = null;
    this.formMode = 'SELECT';
  }
  
  /**
   * Prepare for adding a new record
   */
  clearFormFields() {
    this.selectedRow = null;
    this.formMode = 'INSERT';
  }
  
  /**
   * Set the form mode
   */
  setFormMode(mode) {
    // Normalize to uppercase for consistency
    const normalizedMode = mode.toUpperCase();
    
    // Validate it's a proper SQL operation mode
    if (['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(normalizedMode)) {
      this.formMode = normalizedMode;
      this.log.debug(`Form mode set to: ${this.formMode}`);
    } else {
      this.log.warn(`Invalid form mode: ${mode}, defaulting to SELECT`);
      this.formMode = 'SELECT';
    }
  }
  
  /**
   * Standard save method for any entity
   */
  async saveData(formData, entityType, mode = this.formMode) {
    // Get pageMap from entity type
    const pageMap = pageMapCollection[entityType];
    if (!pageMap) {
      this.log.error(`Cannot save: No pageMap found for ${entityType}`);
      throw new Error(`Missing pageMap for ${entityType}`);
    }
    
    this.log.info(`Saving ${entityType} data in ${mode} mode`);
    
    try {
      // Construct a standard save event name following convention
      const saveEvent = `${entityType}Save`;
      
      // Prepare save parameters
      const params = {
        mode, // SQL mode (INSERT, UPDATE, DELETE)
        entityType,
        data: formData,
        ...this.buildParentParameters(pageMap)
      };
      
      this.log.debug('Executing save with params:', params);
      
      // Execute the save event
      const result = await execEvent(saveEvent, params);
      
      return result;
    } catch (error) {
      this.log.error('Error saving data:', error);
      throw error;
    }
  }
  
  /**
   * Extract parent parameters for child entities
   */
  buildParentParameters(pageMap) {
    const params = {};
    
    // Handle parent-child relationship if specified
    if (pageMap.parentIdField) {
      const parentField = pageMap.parentIdField;
      const parentValue = accountStore.getSelectedEntity(parentField);
      
      if (parentValue) {
        params[parentField] = parentValue;
      }
    }
    
    return params;
  }
}

// Create singleton instance
const dataStore = new DataStore();
export default dataStore;
