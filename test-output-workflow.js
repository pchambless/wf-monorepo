/**
 * Dual-Zone Workflow Template
 * 
 * This template generates workflow.js files with auto-generated and manual zones.
 * The auto-generated zone contains CRUD operations, API calls, and standard patterns.
 * The manual zone allows for custom business logic and specialized workflows.
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

import { execEvent, execDmlWithRefresh } from '@whatsfresh/shared-imports';
import { createLogger } from '@whatsfresh/shared-imports';

const logger = createLogger('plansWorkflow');

/**
 * Auto-generated workflow configuration for plans
 * Generated from: \\wsl$\Ubuntu-22.04\home\paul\wf-monorepo-new\analysis-n-document\genOps\analyzeSchemas\apps\plans\plans.json
 * Generated on: 2025-08-12T15:10:38.578Z
 */
export const workflow = {
  // Entity configuration
  entityName: 'plans',
  tableName: 'api_wf.plans',
  primaryKey: 'id',
  
  
  // Standard CRUD operations
  operations: {
    // List/Grid operations
    list: {
      eventType: 'gridPlans',
      endpoint: '/api/execEventType',
      method: 'POST',
      autoRefresh: true
    },
    
    // Detail/Form operations
    read: {
      eventType: 'formPlansDtl',
      endpoint: '/api/execEventType', 
      method: 'POST',
      requiresId: true
    },
    
    // Create operations
    create: {
      endpoint: '/api/execDML',
      method: 'POST',
      operation: 'INSERT',
      table: 'api_wf.plans',
      refreshEvent: 'gridPlans'
    },
    
    // Update operations
    update: {
      endpoint: '/api/execDML',
      method: 'POST', 
      operation: 'UPDATE',
      table: 'api_wf.plans',
      refreshEvent: 'gridPlans',
      requiresId: true
    },
    
    // Delete operations
    delete: {
      endpoint: '/api/execDML',
      method: 'POST',
      operation: 'DELETE', 
      table: 'api_wf.plans',
      refreshEvent: 'gridPlans',
      requiresId: true
    }
  },

  // Auto-generated field configuration
  fields: {
    
    id: {
      type: 'number',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    cluster: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    name: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    status: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    priority: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    description: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    comments: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    assigned_to: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    deleted_at: {
      type: 'datetime',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    deleted_by: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    created_at: {
      type: 'datetime',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    created_by: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    updated_at: {
      type: 'datetime',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    updated_by: {
      type: 'text',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
    active: {
      type: 'checkbox',
      required: ,
      
      isPrimaryKey: true,
      editable: false,
      visible: false,
      
      
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    },
    
  },

  // Standard workflow functions
  async executeList(params = {}) {
    try {
      logger.debug(`Executing list for plans`, params);
      return await execEvent(this.operations.list.eventType, params);
    } catch (error) {
      logger.error(`List operation failed for plans:`, error);
      throw error;
    }
  },

  async executeRead(id, params = {}) {
    try {
      logger.debug(`Executing read for plans ID: ${id}`, params);
      const readParams = { id: id, ...params };
      return await execEvent(this.operations.read.eventType, readParams);
    } catch (error) {
      logger.error(`Read operation failed for plans ID ${id}:`, error);
      throw error;
    }
  },

  async executeCreate(data) {
    try {
      logger.debug(`Executing create for plans`, data);
      const createData = {
        table: this.operations.create.table,
        operation: this.operations.create.operation,
        data: this.sanitizeData(data, 'create')
      };
      return await execDmlWithRefresh(
        this.operations.create.operation,
        createData,
        this.operations.create.refreshEvent
      );
    } catch (error) {
      logger.error(`Create operation failed for plans:`, error);
      throw error;
    }
  },

  async executeUpdate(id, data) {
    try {
      logger.debug(`Executing update for plans ID: ${id}`, data);
      const updateData = {
        table: this.operations.update.table,
        operation: this.operations.update.operation,
        data: this.sanitizeData(data, 'update'),
        where: { id: id }
      };
      return await execDmlWithRefresh(
        this.operations.update.operation,
        updateData,
        this.operations.update.refreshEvent
      );
    } catch (error) {
      logger.error(`Update operation failed for plans ID ${id}:`, error);
      throw error;
    }
  },

  async executeDelete(id) {
    try {
      logger.debug(`Executing delete for plans ID: ${id}`);
      const deleteData = {
        table: this.operations.delete.table,
        operation: this.operations.delete.operation,
        where: { id: id }
      };
      return await execDmlWithRefresh(
        this.operations.delete.operation,
        deleteData,
        this.operations.delete.refreshEvent
      );
    } catch (error) {
      logger.error(`Delete operation failed for plans ID ${id}:`, error);
      throw error;
    }
  },

  // Data sanitization for DML operations
  sanitizeData(data, operation) {
    const sanitized = { ...data };
    
    // Remove primary key from create operations
    if (operation === 'create' && sanitized[this.primaryKey]) {
      delete sanitized[this.primaryKey];
    }
    
    // Remove system fields that shouldn't be modified
    const systemFields = ['created_at', 'updated_at'];
    systemFields.forEach(field => {
      if (sanitized[field]) delete sanitized[field];
    });
    
    return sanitized;
  }
};

// 🤖 END AUTO-GENERATED ZONE

// ✋ MANUAL CUSTOMIZATION ZONE - Never overwrite
// Add your custom business logic, validation, and specialized workflows below
// This section is preserved during regeneration

export const customWorkflow = {
  // Custom validation rules specific to plans
  businessValidation: {
    // Add custom validation functions here
    // Example:
    // validateStatus: (status) => ['pending', 'active', 'completed'].includes(status),
  },

  // Custom status transitions and business rules
  statusTransitions: {
    // Define allowed status changes
    // Example:
    // pending: ['active', 'cancelled'],
    // active: ['completed', 'on-hold'],
  },

  // Custom operations beyond basic CRUD
  customOperations: {
    // Add specialized business operations here
    // Example:
    // async archive(id) {
    //   return await this.executeUpdate(id, { status: 'archived', deleted_at: new Date() });
    // },
  },

  // Event handlers for workflow integration
  eventHandlers: {
    // Add custom event handling logic
    // Example:
    // onBeforeCreate: async (data) => { /* validation logic */ },
    // onAfterUpdate: async (id, data) => { /* notification logic */ },
  },

  // Integration with other systems
  integrations: {
    // Add external system integrations
    // Example:
    // notificationService: null,
    // auditService: null,
  }
};

// ✋ END MANUAL CUSTOMIZATION ZONE

export default workflow;