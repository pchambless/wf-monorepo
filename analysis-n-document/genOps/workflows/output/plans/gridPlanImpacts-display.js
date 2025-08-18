/**
 * Display Configuration for gridPlanImpacts
 * Generated from: plans/gridPlanImpacts.eventType
 * Generated on: 2025-08-14T00:45:44.550Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for gridPlanImpacts
 * Generated from: plans/gridPlanImpacts.eventType
 * Generated on: 2025-08-14T00:45:44.550Z
 */
export const display = {
  // Entity metadata
  entityName: 'gridPlanImpacts',
  tableName: 'api_wf.plan_impacts',
  primaryKey: 'id',
  
  // Grid configuration
  grid: {
    columns: [
      {
        field: 'id',
        headerName: 'Id',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'change_type',
        headerName: 'Change_type',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'description',
        headerName: 'Description',
        type: '',
        width: 150
      },
      {
        field: 'fileName',
        headerName: 'Filename',
        type: '',
        width: 150
      },
      {
        field: 'fileFolder',
        headerName: 'Filefolder',
        type: '',
        width: 150
      },
      {
        field: 'created_at',
        headerName: 'Created_at',
        type: '',
        width: 150
      },
      {
        field: 'created_by',
        headerName: 'Created_by',
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
            name: 'id',
            label: 'Id',
            type: '',
            required: true
          },
          {
            name: 'change_type',
            label: 'Change_type',
            type: '',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: ''
          },
          {
            name: 'fileName',
            label: 'Filename',
            type: ''
          },
          {
            name: 'fileFolder',
            label: 'Filefolder',
            type: ''
          },
          {
            name: 'created_at',
            label: 'Created_at',
            type: ''
          },
          {
            name: 'created_by',
            label: 'Created_by',
            type: ''
          }
        ]
      }
    ]
  },
  
  // Actions - conditionally generated based on supported operations
  actions: {
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