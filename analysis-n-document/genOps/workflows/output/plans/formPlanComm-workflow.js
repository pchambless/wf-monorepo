/**
 * Dual-Zone Workflow Template for formPlanComm
 * Generated from: plans/formPlanComm.eventType
 * Generated on: 2025-08-14T00:45:44.499Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger, contextStore } from '@whatsfresh/shared-imports';

const logger = createLogger('formPlanCommWorkflow');

/**
 * Auto-generated workflow configuration for formPlanComm
 * Generated from: plans/formPlanComm.eventType
 * Generated on: 2025-08-14T00:45:44.499Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'formPlanComm',
  tableName: 'api_wf.plans_communications',
  primaryKey: 'id',
  
  // CRUD operations - conditionally generated based on supported operations
  operations: {
    // List/Grid operations
    list: {
      eventType: 'gridFormplancomm',
      endpoint: '/api/execEventType',
      method: 'POST',
      autoRefresh: true
    },
    
    // Detail/Form operations
    read: {
      eventType: 'formFormplancommDtl',
      endpoint: '/api/execEventType', 
      method: 'POST',
      requiresId: true
    },
    
    // Create operations
    create: {
      endpoint: '/api/execDML',
      method: 'POST',
      table: 'api_wf.plans_communications',
      operation: 'INSERT',
      autoRefresh: true
    }
    
    
  },
  
  // Row click event handling - auto-generated for all grids
  events: {
    onRowClick: (rowData) => {
      const id = rowData['id'];
      
      // Set context parameter for child components
      contextStore.setParam('formplancommID', id);
      
      // Log selection for debugging
      logger.info('Formplancomm selected:', id);
      
      
      // Custom display strategy hook (implemented in manual zone)
      if (this.displayStrategy && typeof this.displayStrategy.onRowClick === 'function') {
        this.displayStrategy.onRowClick(rowData);
      }
    }
  },
  
  // Child component configuration
  hasChildComponents: false,
  
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
    plan_id: {
      type: 'INT UNSIGNED',
      uiType: '',
      label: 'Plan_id',
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
    },
    message: {
      type: 'TEXT',
      uiType: '',
      label: 'Message',
      required: true,
      validationRules: [
  "required",
  "type:text"
],
      editable: true
    },
    status: {
      type: 'VARCHAR(50)',
      uiType: '',
      label: 'Status',
      required: true,
      validationRules: [
  "required",
  "maxLength:50",
  "type:text"
],
      editable: true
    },
    created_at: {
      type: 'TIMESTAMP',
      uiType: '',
      label: 'Created_at',
      validationRules: [
  "type:datetime"
],
      editable: true
    },
    created_by: {
      type: 'VARCHAR(50)',
      uiType: '',
      label: 'Created_by',
      validationRules: [
  "maxLength:50",
  "type:text"
],
      editable: true
    }
  },
  
  // Permissions configuration
  permissions: {
    create: true,
    read: true,
    update: false,
    delete: false,
    export: true
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
          parentEntity: 'formPlanComm',
          parentId: contextStore.getParam('formplancommID')
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
  
  /**
   * Create a new formPlanComm record
   */
  async createFormplancomm(data) {
    logger.info('Creating new formPlanComm', { data });
    
    try {
      const result = await execDmlWithRefresh({
        ...workflow.operations.create,
        data
      });
      
      logger.info('formPlanComm created successfully', { id: result.id });
      return result;
    } catch (error) {
      logger.error('Failed to create formPlanComm', { error, data });
      throw error;
    }
  }
  
  
  },
  
  /**
   * Load formPlanComm list/grid data
   */
  async loadFormplancommList(params = {}) {
    logger.info('Loading formPlanComm list', { params });
    
    try {
      const result = await execEvent({
        ...workflow.operations.list,
        params
      });
      
      logger.info('formPlanComm list loaded successfully', { count: result?.data?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to load formPlanComm list', { error, params });
      throw error;
    }
  },
  
  /**
   * Load single formPlanComm record for form
   */
  async loadFormplancommDetail(id) {
    logger.info('Loading formPlanComm detail', { id });
    
    try {
      const result = await execEvent({
        ...workflow.operations.read,
        params: { id: id }
      });
      
      logger.info('formPlanComm detail loaded successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to load formPlanComm detail', { error, id });
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