/**
 * Dual-Zone Workflow Template for formPlanImpact
 * Generated from: plans/formPlanImpact.eventType
 * Generated on: 2025-08-14T00:45:44.523Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger, contextStore } from '@whatsfresh/shared-imports';

const logger = createLogger('formPlanImpactWorkflow');

/**
 * Auto-generated workflow configuration for formPlanImpact
 * Generated from: plans/formPlanImpact.eventType
 * Generated on: 2025-08-14T00:45:44.523Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'formPlanImpact',
  tableName: 'api_wf.plans_impacts',
  primaryKey: 'id',
  
  // CRUD operations - conditionally generated based on supported operations
  operations: {
    // List/Grid operations
    list: {
      eventType: 'gridFormplanimpact',
      endpoint: '/api/execEventType',
      method: 'POST',
      autoRefresh: true
    },
    
    // Detail/Form operations
    read: {
      eventType: 'formFormplanimpactDtl',
      endpoint: '/api/execEventType', 
      method: 'POST',
      requiresId: true
    },
    
    // Create operations
    create: {
      endpoint: '/api/execDML',
      method: 'POST',
      table: 'api_wf.plans_impacts',
      operation: 'INSERT',
      autoRefresh: true
    }
    
    
  },
  
  // Row click event handling - auto-generated for all grids
  events: {
    onRowClick: (rowData) => {
      const id = rowData['id'];
      
      // Set context parameter for child components
      contextStore.setParam('formplanimpactID', id);
      
      // Log selection for debugging
      logger.info('Formplanimpact selected:', id);
      
      
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
    file_path: {
      type: 'VARCHAR(500)',
      uiType: '',
      label: 'File_path',
      required: true,
      validationRules: [
  "required",
  "maxLength:500",
  "type:text"
],
      editable: true
    },
    phase: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'Phase',
      required: true,
      validationRules: [
  "required",
  "maxLength:20",
  "type:text"
],
      editable: true
    },
    change_type: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'Change_type',
      required: true,
      validationRules: [
  "required",
  "maxLength:20",
  "type:text"
],
      editable: true
    },
    description: {
      type: 'TEXT',
      uiType: '',
      label: 'Description',
      validationRules: [
  "type:text"
],
      editable: true
    },
    batch_id: {
      type: 'VARCHAR(36)',
      uiType: '',
      label: 'Batch_id',
      validationRules: [
  "maxLength:36",
  "type:text"
],
      editable: true
    },
    affected_apps: {
      type: 'JSON',
      uiType: '',
      label: 'Affected_apps',
      validationRules: [
  "type:text"
],
      editable: true
    },
    auto_generated: {
      type: 'TINYINT(1)',
      uiType: '',
      label: 'Auto_generated',
      required: true,
      validationRules: [
  "required",
  "type:checkbox"
],
      editable: true
    },
    cross_app_analysis: {
      type: 'JSON',
      uiType: '',
      label: 'Cross_app_analysis',
      validationRules: [
  "type:text"
],
      editable: true
    },
    fileName: {
      type: 'VARCHAR(255)',
      uiType: '',
      label: 'Filename',
      validationRules: [
  "maxLength:255",
  "type:text"
],
      editable: true
    },
    fileFolder: {
      type: 'VARCHAR(255)',
      uiType: '',
      label: 'Filefolder',
      validationRules: [
  "maxLength:255",
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
          parentEntity: 'formPlanImpact',
          parentId: contextStore.getParam('formplanimpactID')
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
   * Create a new formPlanImpact record
   */
  async createFormplanimpact(data) {
    logger.info('Creating new formPlanImpact', { data });
    
    try {
      const result = await execDmlWithRefresh({
        ...workflow.operations.create,
        data
      });
      
      logger.info('formPlanImpact created successfully', { id: result.id });
      return result;
    } catch (error) {
      logger.error('Failed to create formPlanImpact', { error, data });
      throw error;
    }
  }
  
  
  },
  
  /**
   * Load formPlanImpact list/grid data
   */
  async loadFormplanimpactList(params = {}) {
    logger.info('Loading formPlanImpact list', { params });
    
    try {
      const result = await execEvent({
        ...workflow.operations.list,
        params
      });
      
      logger.info('formPlanImpact list loaded successfully', { count: result?.data?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to load formPlanImpact list', { error, params });
      throw error;
    }
  },
  
  /**
   * Load single formPlanImpact record for form
   */
  async loadFormplanimpactDetail(id) {
    logger.info('Loading formPlanImpact detail', { id });
    
    try {
      const result = await execEvent({
        ...workflow.operations.read,
        params: { id: id }
      });
      
      logger.info('formPlanImpact detail loaded successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to load formPlanImpact detail', { error, id });
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