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

const logger = createLogger('{{entityName}}Workflow');

/**
 * Auto-generated workflow configuration for {{entityName}}
 * Generated from: {{schemaSource}}
 * Generated on: {{generatedDate}}
 */
export const workflow = {
  // Entity configuration
  entityName: '{{entityName}}',
  tableName: '{{tableName}}',
  primaryKey: '{{primaryKey}}',
  {{#if parentKey}}
  parentKey: '{{parentKey}}',
  parentTable: '{{parentTable}}',
  {{/if}}
  
  // Standard CRUD operations
  operations: {
    // List/Grid operations
    list: {
      eventType: 'grid{{EntityName}}',
      endpoint: '/api/execEventType',
      method: 'POST',
      autoRefresh: true
    },
    
    // Detail/Form operations
    read: {
      eventType: 'form{{EntityName}}Dtl',
      endpoint: '/api/execEventType', 
      method: 'POST',
      requiresId: true
    },
    
    // Create operations
    create: {
      endpoint: '/api/execDML',
      method: 'POST',
      operation: 'INSERT',
      table: '{{tableName}}',
      refreshEvent: 'grid{{EntityName}}'
    },
    
    // Update operations
    update: {
      endpoint: '/api/execDML',
      method: 'POST', 
      operation: 'UPDATE',
      table: '{{tableName}}',
      refreshEvent: 'grid{{EntityName}}',
      requiresId: true
    },
    
    // Delete operations
    delete: {
      endpoint: '/api/execDML',
      method: 'POST',
      operation: 'DELETE', 
      table: '{{tableName}}',
      refreshEvent: 'grid{{EntityName}}',
      requiresId: true
    }
  },

  // Auto-generated field configuration
  fields: {
    {{#each fields}}
    {{name}}: {
      type: '{{uiType}}',
      required: {{#if (includes validationRules "required")}}true{{else}}false{{/if}},
      {{#if primaryKey}}
      isPrimaryKey: true,
      editable: false,
      visible: false,
      {{/if}}
      {{#if (eq uiType "select")}}
      widget: '{{widget}}',
      {{/if}}
      validationRules: {{{json validationRules}}},
      inputProps: {{{json inputProps}}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  },

  // Standard workflow functions
  async executeList(params = {}) {
    try {
      logger.debug(`Executing list for {{entityName}}`, params);
      return await execEvent(this.operations.list.eventType, params);
    } catch (error) {
      logger.error(`List operation failed for {{entityName}}:`, error);
      throw error;
    }
  },

  async executeRead(id, params = {}) {
    try {
      logger.debug(`Executing read for {{entityName}} ID: ${id}`, params);
      const readParams = { {{primaryKey}}: id, ...params };
      return await execEvent(this.operations.read.eventType, readParams);
    } catch (error) {
      logger.error(`Read operation failed for {{entityName}} ID ${id}:`, error);
      throw error;
    }
  },

  async executeCreate(data) {
    try {
      logger.debug(`Executing create for {{entityName}}`, data);
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
      logger.error(`Create operation failed for {{entityName}}:`, error);
      throw error;
    }
  },

  async executeUpdate(id, data) {
    try {
      logger.debug(`Executing update for {{entityName}} ID: ${id}`, data);
      const updateData = {
        table: this.operations.update.table,
        operation: this.operations.update.operation,
        data: this.sanitizeData(data, 'update'),
        where: { {{primaryKey}}: id }
      };
      return await execDmlWithRefresh(
        this.operations.update.operation,
        updateData,
        this.operations.update.refreshEvent
      );
    } catch (error) {
      logger.error(`Update operation failed for {{entityName}} ID ${id}:`, error);
      throw error;
    }
  },

  async executeDelete(id) {
    try {
      logger.debug(`Executing delete for {{entityName}} ID: ${id}`);
      const deleteData = {
        table: this.operations.delete.table,
        operation: this.operations.delete.operation,
        where: { {{primaryKey}}: id }
      };
      return await execDmlWithRefresh(
        this.operations.delete.operation,
        deleteData,
        this.operations.delete.refreshEvent
      );
    } catch (error) {
      logger.error(`Delete operation failed for {{entityName}} ID ${id}:`, error);
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
  // Custom validation rules specific to {{entityName}}
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