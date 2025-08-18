/**
 * Display Configuration for selectPlanStatus
 * Generated from: plans/selectPlanStatus.eventType
 * Generated on: 2025-08-14T00:45:44.588Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for selectPlanStatus
 * Generated from: plans/selectPlanStatus.eventType
 * Generated on: 2025-08-14T00:45:44.588Z
 */
export const display = {
  // Entity metadata
  entityName: 'selectPlanStatus',
  tableName: '',
  primaryKey: '',
  
  // Grid configuration
  grid: {
    columns: [
      {
        field: '',
        headerName: '',
        type: '',
        width: 150
      },
      {
        field: '',
        headerName: '',
        type: '',
        width: 150
      }
    ]
  },
  
  // Form configuration
  form: {
    sections: [
      {
        title: 'Basic Information',
        fields: [
          {
            name: '',
            label: '',
            type: ''
          },
          {
            name: '',
            label: '',
            type: ''
          }
        ]
      }
    ]
  },
  
  // Actions - conditionally generated based on supported operations
  actions: {
    create: { enabled: true, label: 'Add Selectplanstatus' },
    view: { enabled: true, label: 'View' },
    edit: { enabled: true, label: 'Edit' },
    delete: { enabled: true, label: 'Delete' }
  }
};

// 🤖 END AUTO-GENERATED ZONE

// ✋ MANUAL CUSTOMIZATION ZONE - Never overwrite
// Add your custom display configurations here

export const customDisplay = {
  // Add custom grid columns
  customColumns: [
    // Example:
    // {
    //   field: 'custom_action',
    //   headerName: 'Actions',
    //   cellRenderer: 'customActionRenderer',
    //   width: 120,
    //   pinned: 'right'
    // }
  ],
  
  // Add custom form sections
  customSections: [
    // Example:
    // {
    //   title: 'Custom Section',
    //   key: 'custom',
    //   fields: []
    // }
  ],
  
  // Add custom field overrides
  fieldOverrides: {
    // Example:
    // field_name: {
    //   customProperty: 'value'
    // }
  }
};

// ✋ END MANUAL CUSTOMIZATION ZONE

// Export combined display configuration
export default {
  ...display,
  grid: {
    ...display.grid,
    columns: [...display.grid.columns, ...customDisplay.customColumns]
  },
  form: {
    ...display.form,
    sections: [...display.form.sections, ...customDisplay.customSections]
  },
  fields: {
    ...display.fields,
    ...customDisplay.fieldOverrides
  }
};