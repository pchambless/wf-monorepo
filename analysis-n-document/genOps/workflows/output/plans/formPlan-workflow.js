/**
 * Dual-Zone Workflow Template for formPlan
 * Generated from: plans/formPlan.eventType
 * Generated on: 2025-08-14T00:45:44.460Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger, contextStore } from '@whatsfresh/shared-imports';

const logger = createLogger('formPlanWorkflow');

/**
 * Auto-generated workflow configuration for formPlan
 * Generated from: plans/formPlan.eventType
 * Generated on: 2025-08-14T00:45:44.460Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'formPlan',
  tableName: 'api_wf.plans',
  primaryKey: 'id',

  // CRUD operations - conditionally generated based on supported operations
  operations: {
    // List/Grid operations
    list: {
      eventType: 'gridFormplan',
      endpoint: '/api/execEventType',
      method: 'POST',
      autoRefresh: true
    },

    // Detail/Form operations
    read: {
      eventType: 'formFormplanDtl',
      endpoint: '/api/execEventType',
      method: 'POST',
      requiresId: true
    },

    // Create operations
    create: {
      endpoint: '/api/execDML',
      method: 'POST',
      table: 'api_wf.plans',
      operation: 'INSERT',
      autoRefresh: true
    },

    // Update operations
    update: {
      endpoint: '/api/execDML',
      method: 'POST',
      table: 'api_wf.plans',
      operation: 'UPDATE',
      requiresId: true,
      autoRefresh: true
    }

  },

  // Row click event handling - auto-generated for all grids
  events: {
    onRowClick: (rowData) => {
      const id = rowData['id'];

      // Set context parameter for child components
      contextStore.setParam('formplanID', id);

      // Log selection for debugging
      logger.info('Formplan selected:', id);


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
    cluster: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'Cluster',
      required: true,
      validationRules: [
        "required",
        "maxLength:20",
        "type:text"
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
    },
    status: {
      type: 'VARCHAR(100)',
      uiType: '',
      label: 'Status',
      required: true,
      validationRules: [
        "required",
        "maxLength:100",
        "type:text"
      ],
      editable: true
    },
    priority: {
      type: 'VARCHAR(20)',
      uiType: '',
      label: 'Priority',
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
    comments: {
      type: 'TEXT',
      uiType: '',
      label: 'Comments',
      validationRules: [
        "type:text"
      ],
      editable: true
    },
    assigned_to: {
      type: 'VARCHAR(50)',
      uiType: '',
      label: 'Assigned_to',
      validationRules: [
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
      required: true,
      validationRules: [
        "required",
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
    update: true,
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
          parentEntity: 'formPlan',
          parentId: contextStore.getParam('formplanID')
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
   * Create a new formPlan record
   */
  async createFormplan(data) {
    logger.info('Creating new formPlan', { data });

    try {
      const result = await execDmlWithRefresh({
        ...workflow.operations.create,
        data
      });

      logger.info('formPlan created successfully', { id: result.id });
      return result;
    } catch (error) {
      logger.error('Failed to create formPlan', { error, data });
      throw error;
    }
  },

  /**
   * Update an existing formPlan record
   */
  async updateFormplan(id, data) {
    logger.info('Updating formPlan', { id, data });

    try {
      const result = await execDmlWithRefresh({
        ...workflow.operations.update,
        data: { ...data, id: id }
      });

      logger.info('formPlan updated successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to update formPlan', { error, id, data });
      throw error;
    }
  }

},

  /**
   * Load formPlan list/grid data
   */
  async loadFormplanList(params = {}) {
    logger.info('Loading formPlan list', { params });

    try {
      const result = await execEvent({
        ...workflow.operations.list,
        params
      });

      logger.info('formPlan list loaded successfully', { count: result?.data?.length || 0 });
      return result;
    } catch (error) {
      logger.error('Failed to load formPlan list', { error, params });
      throw error;
    }
  },

    /**
     * Load single formPlan record for form
     */
    async loadFormplanDetail(id) {
  logger.info('Loading formPlan detail', { id });

  try {
    const result = await execEvent({
      ...workflow.operations.read,
      params: { id: id }
    });

    logger.info('formPlan detail loaded successfully', { id });
    return result;
  } catch (error) {
    logger.error('Failed to load formPlan detail', { error, id });
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