import { makeAutoObservable } from 'mobx';
import createLogger from '../utils/logger';
import accountStore from './accountStore';

const log = createLogger('ParamStore');

class ParamStore {
  // Single map to store all entity selection parameters
  entityParams = {};
  
  constructor() {
    makeAutoObservable(this);
  }
  
  // Set selected entity
  setSelectedEntity(entityType, id) {
    log.debug(`Setting selected ${entityType}:`, id);
    this.entityParams[entityType] = id;
  }
  
  // Get selected entity
  getSelectedEntity(entityType) {
    return this.entityParams[entityType] || null;
  }
  
  // Get parent ID for a specific list event
  getParentIDForEvent(eventType, pageMap) {
    // Extract parent ID field from pageMap
    const parentIDField = pageMap?.pageConfig?.parentIdField;
    
    if (!parentIDField) {
      // Special case for top-level entities that use acctID
      if (eventType === 'ingrTypeList' || eventType === 'prodTypeList' || 
          eventType === 'vndrList' || eventType === 'brndList' || 
          eventType === 'wrkrList') {
        return accountStore.currentAcctID;
      }
      return null;
    }
    
    // Return the parent entity's selected ID
    return this.getSelectedEntity(parentIDField);
  }
  
  // Generate API parameters for an event
  getEventParams(eventType, pageMap) {
    const params = {};
    
    // Handle account-level queries
    if (eventType === 'ingrTypeList' || eventType === 'prodTypeList' || 
        eventType === 'vndrList' || eventType === 'brndList' || 
        eventType === 'wrkrList') {
      params[':acctID'] = accountStore.currentAcctID;
      return params;
    }
    
    // Handle entity-specific queries
    if (pageMap?.pageConfig?.parentIdField) {
      const parentField = pageMap.pageConfig.parentIdField;
      const parentIDValue = this.getSelectedEntity(parentField);
      
      if (parentIDValue) {
        params[`:${parentField}`] = parentIDValue;
      } else {
        log.warn(`Missing parent ID for ${eventType}`, { parentField });
      }
    }
    
    return params;
  }
}

const paramStore = new ParamStore();
export default paramStore;
