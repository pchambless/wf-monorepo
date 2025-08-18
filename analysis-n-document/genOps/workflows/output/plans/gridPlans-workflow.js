/**
 * Dual-Zone Workflow Template for gridPlans
 * Generated from: plans/gridPlans.eventType
 * Generated on: 2025-08-14T00:45:44.565Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger, contextStore } from '@whatsfresh/shared-imports';

const logger = createLogger('gridPlansWorkflow');

/**
 * Auto-generated workflow configuration for gridPlans
 * Generated from: plans/gridPlans.eventType
 * Generated on: 2025-08-14T00:45:44.565Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'gridPlans',
  tableName: 'api_wf.plans',
  primaryKey: 'id',
  
  // CRUD operations - conditionally generated based on supported operations
  operations: {
    
    
    
  },
  
  // Row click event handling - auto-generated for all grids
  events: {
    onRowClick: (rowData) => {
      const id = rowData['id'];
      
      // Set context parameter for child components
      contextStore.setParam('gridplansID', id);
      
      // Log selection for debugging
      logger.info('Gridplans selected:', id);
      
      
      // Custom display strategy hook (implemented in manual zone)
      if (this.displayStrategy && typeof this.displayStrategy.onRowClick === 'function') {
        this.displayStrategy.onRowClick(rowData);
      }
    }
  },
  
  // Child component configuration
  hasChildComponents: true,
  childComponents: ['tabPlan', 'tabPlanComms', 'tabPlanImpacts'],
  
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
    name: {
      type: 'VARCHAR(255)',
      uiType: '',
      label: 'Name',
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
          parentEntity: 'gridPlans',
          parentId: contextStore.getParam('gridplansID')
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
   * Load gridPlans list/grid data
   */
  async loadGridplansList(params = {}) {
    logger.info('Loading gridPlans list', { params });
    
    try {
      const result = await execEvent({
        ...workflow.operations.list,
        params
      });
      
      logger.info('gridPlans list loaded successfully', { count: result?.data?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to load gridPlans list', { error, params });
      throw error;
    }
  },
  
  /**
   * Load single gridPlans record for form
   */
  async loadGridplansDetail(id) {
    logger.info('Loading gridPlans detail', { id });
    
    try {
      const result = await execEvent({
        ...workflow.operations.read,
        params: { id: id }
      });
      
      logger.info('gridPlans detail loaded successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to load gridPlans detail', { error, id });
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