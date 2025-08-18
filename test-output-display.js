/**
 * Dual-Zone Display Template
 * 
 * This template generates display.js files with auto-generated and manual zones.
 * The auto-generated zone contains field configurations, layout defaults, and validation.
 * The manual zone allows for custom UI layouts, field groupings, and display logic.
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for plans
 * Generated from: \\wsl$\Ubuntu-22.04\home\paul\wf-monorepo-new\analysis-n-document\genOps\analyzeSchemas\apps\plans\plans.json
 * Generated on: 2025-08-12T15:10:38.578Z
 */
export const display = {
  // Entity metadata
  entityName: 'plans',
  tableName: 'api_wf.plans',
  primaryKey: 'id',
  

  // Auto-generated field definitions
  fields: {
    
    id: {
      // Database properties
      type: 'INT UNSIGNED',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'number',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    cluster: {
      // Database properties
      type: 'VARCHAR(20)',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    name: {
      // Database properties
      type: 'VARCHAR(255)',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    status: {
      // Database properties
      type: 'VARCHAR(100)',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    priority: {
      // Database properties
      type: 'VARCHAR(20)',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    description: {
      // Database properties
      type: 'TEXT',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    comments: {
      // Database properties
      type: 'TEXT',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    assigned_to: {
      // Database properties
      type: 'VARCHAR(50)',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    deleted_at: {
      // Database properties
      type: 'TIMESTAMP',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'datetime',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    deleted_by: {
      // Database properties
      type: 'VARCHAR(50)',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    created_at: {
      // Database properties
      type: 'TIMESTAMP',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'datetime',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    created_by: {
      // Database properties
      type: 'VARCHAR(50)',
      nullable: false,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    updated_at: {
      // Database properties
      type: 'TIMESTAMP',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'datetime',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    updated_by: {
      // Database properties
      type: 'VARCHAR(50)',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'text',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
    active: {
      // Database properties
      type: 'TINYINT(1) AS ((case when (deleted_at is',
      nullable: true,
      ,
      {{/if}}
      
      // UI properties
      uiType: 'checkbox',
      label: '',
      
      // Visibility rules
      
      tableVisible: false,
      formVisible: false,
      searchable: false,
      {{else}}
      tableVisible: {{#if (includes ../hiddenInTable name)}}false{{else}}true,
      formVisible: ,
      searchable: ,
      {{/if}}
      
      // Validation
      required: ,
      validationRules: {{{json validationRules}}},
      
      // Input properties
      inputProps: {
        
        {{/if}}
        
        
        
        
        ...{{{json inputProps}}}
      }
    },
    
  },

  // Auto-generated layout defaults
  defaultLayout: {
    // Grid/Table configuration
    grid: {
      columns: [
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
        
        {{/unless}}
        {{/unless}}
        
      ],
      defaultSort: [{ field: 'id', sort: 'desc' }],
      pageSize: 25,
      enableFiltering: true,
      enableSorting: true
    },

    // Form configuration
    form: {
      sections: [
        {
          title: 'Plans Details',
          fields: [
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
            
            {{/unless}}
            {{/unless}}
            
          ]
        }
      ],
      layout: 'single-column', // single-column, two-column, or tabs
      submitButton: {
        createText: 'Create Plans',
        updateText: 'Update Plans',
        position: 'bottom-right'
      }
    }
  },

  // Auto-generated validation patterns
  baseValidation: {
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  },

  // Helper functions for field processing
  getFieldConfig(fieldName) {
    return this.fields[fieldName] || null;
  },

  getVisibleFields(context = 'table') {
    return Object.entries(this.fields)
      .filter(([name, config]) => {
        if (context === 'table') return config.tableVisible;
        if (context === 'form') return config.formVisible;
        return true;
      })
      .map(([name]) => name);
  },

  getRequiredFields() {
    return Object.entries(this.fields)
      .filter(([name, config]) => config.required)
      .map(([name]) => name);
  }
};

// 🤖 END AUTO-GENERATED ZONE

// ✋ MANUAL CUSTOMIZATION ZONE - Never overwrite
// Add your custom UI configurations, field groupings, and display logic below
// This section is preserved during regeneration

export const customDisplay = {
  // Custom field groupings for forms
  fieldGroups: {
    // Example: Group related fields together
    // basic: ['name', 'description', 'status'],
    // metadata: ['created_at', 'created_by', 'updated_at', 'updated_by'],
    // advanced: ['priority', 'assigned_to', 'comments']
  },

  // Custom column configurations for tables
  columnConfig: {
    // Override auto-generated column settings
    // Example:
    // name: { width: 200, pinned: 'left' },
    // status: { width: 120, cellRenderer: 'StatusBadge' },
    // created_at: { width: 150, hide: true }
  },

  // Custom form layouts
  formLayout: {
    // Override default form organization
    // Example:
    // sections: [
    //   {
    //     title: 'Basic Information',
    //     fields: ['name', 'description', 'status'],
    //     columns: 2
    //   },
    //   {
    //     title: 'Advanced Settings', 
    //     fields: ['priority', 'assigned_to'],
    //     columns: 1,
    //     collapsible: true
    //   }
    // ]
  },

  // Custom grid configurations
  gridConfig: {
    // Override default grid behavior
    // Example:
    // rowHeight: 40,
    // headerHeight: 35,
    // enableRowSelection: true,
    // enableColumnReorder: true,
    // customToolbar: ['export', 'filter', 'refresh']
  },

  // Custom validation rules
  customValidation: {
    // Add business-specific validation
    // Example:
    // validateStatus: (value, record) => {
    //   if (value === 'completed' && !record.description) {
    //     return 'Description required for completed items';
    //   }
    //   return true;
    // }
  },

  // Custom display formatters
  formatters: {
    // Add custom display formatting
    // Example:
    // status: (value) => value?.toUpperCase(),
    // created_at: (value) => new Date(value).toLocaleDateString(),
    // priority: (value) => ({ low: '🟢', medium: '🟡', high: '🔴' }[value] || value)
  },

  // Custom action configurations
  actions: {
    // Define custom actions for records
    // Example:
    // archive: {
    //   label: 'Archive',
    //   icon: 'archive',
    //   condition: (record) => record.status !== 'archived',
    //   handler: async (record) => { /* custom logic */ }
    // }
  }
};

// ✋ END MANUAL CUSTOMIZATION ZONE

export default display;