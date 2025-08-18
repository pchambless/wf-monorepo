/**
 * Dual-Zone Workflow Template for gridPlanComms
 * Generated from: plans/gridPlanComms.eventType
 * Generated on: 2025-08-14T00:45:44.537Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger, contextStore } from '@whatsfresh/shared-imports';

const logger = createLogger('gridPlanCommsWorkflow');

/**
 * Auto-generated workflow configuration for gridPlanComms
 * Generated from: plans/gridPlanComms.eventType
 * Generated on: 2025-08-14T00:45:44.537Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'gridPlanComms',
  tableName: 'api_wf.plan_communications',
  primaryKey: 'id',
  
  // CRUD operations - conditionally generated based on supported operations
  operations: {
    
    
    
  },
  
  // Row click event handling - auto-generated for all grids
  events: {
    onRowClick: (rowData) => {
      const id = rowData['id'];
      
      // Set context parameter for child components
      contextStore.setParam('gridplancommsID', id);
      
      // Log selection for debugging
      logger.info('Gridplancomms selected:', id);
      
      
      // Custom display strategy hook (implemented in manual zone)
      if (this.displayStrategy && typeof this.displayStrategy.onRowClick === 'function') {
        this.displayStrategy.onRowClick(rowData);
      }
    }
  },
  
  // Child component configuration
  hasChildComponents: true,
  childComponents: ['formPlanComm'],
  
  // Field configuration for forms and validation
  fields: {
    id: {
      type: 'INT UNSIGNED',
      uiType: '',
      label: 'Id',
      required: true,
      validationRules: [
  "required",
  "type:number"
],
      editable: true
    },
    from_agent: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'From_agent',
      required: true,
      validationRules: [
  "required",
  "maxLength:20",
  "type:text"
],
      editable: true
    },
    to_agent: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'To_agent',
      required: true,
      validationRules: [
  "required",
  "maxLength:20",
  "type:text"
],
      editable: true
    },
    type: {
      type: 'VARCHAR(30)',
      uiType: '',
      label: 'Type',
      required: true,
      validationRules: [
  "required",
  "maxLength:30",
  "type:text"
],
      editable: true
    },
    subject: {
      type: 'VARCHAR(255)',
      uiType: '',
      label: 'Subject',
      required: true,
      validationRules: [
  "required",
  "maxLength:255",
  "type:text"
],
      editable: true
    }
  },
  
  // Permissions configuration
  permissions: {
    create: false,
    read: false,
    update: false,
    delete: false,
    export: false
  }
};

// Helper function for refreshing child components
function refreshChildComponents(componentNames) {
  if (!Array.isArray(componentNames)) return;
  
  componentNames.forEach(componentName => {
    try {
      // Trigger refresh event for each child component
      const refreshEvent = new CustomEvent(`refresh-${componentName}`, {
        detail: { 
          parentEntity: 'gridPlanComms',
          parentId: contextStore.getParam('gridplancommsID')
        }
      });
      document.dispatchEvent(refreshEvent);
      
      logger.info(`Refreshed child component: ${componentName}`);
    } catch (error) {
      logger.warn(`Failed to refresh child component ${componentName}:`, error);
    }
  });
}

// Workflow functions - conditionally generated based on supported operations
export const workflowFunctions = {
  
  
  
  },
  
  /**
   * Load gridPlanComms list/grid data
   */
  async loadGridplancommsList(params = {}) {
    logger.info('Loading gridPlanComms list', { params });
    
    try {
      const result = await execEvent({
        ...workflow.operations.list,
        params
      });
      
      logger.info('gridPlanComms list loaded successfully', { count: result?.data?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to load gridPlanComms list', { error, params });
      throw error;
    }
  },
  
  /**
   * Load single gridPlanComms record for form
   */
  async loadGridplancommsDetail(id) {
    logger.info('Loading gridPlanComms detail', { id });
    
    try {
      const result = await execEvent({
        ...workflow.operations.read,
        params: { id: id }
      });
      
      logger.info('gridPlanComms detail loaded successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to load gridPlanComms detail', { error, id });
      throw error;
    }
  }
};

// 🤖 END AUTO-GENERATED ZONE

// ✋ MANUAL CUSTOMIZATION ZONE - Never overwrite
// Add your custom workflow functions and business logic here

export const customWorkflow = {
  // Add custom workflow functions here
  // Example:
  // async customBusinessLogic(data) {
  //   // Your custom logic here
  // }
};

// ✋ END MANUAL CUSTOMIZATION ZONE

// Export combined workflow
export default {
  ...workflow,
  ...workflowFunctions,
  ...customWorkflow
};