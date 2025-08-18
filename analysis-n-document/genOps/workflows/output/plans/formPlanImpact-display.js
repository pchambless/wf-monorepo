/**
 * Display Configuration for formPlanImpact
 * Generated from: plans/formPlanImpact.eventType
 * Generated on: 2025-08-14T00:45:44.523Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for formPlanImpact
 * Generated from: plans/formPlanImpact.eventType
 * Generated on: 2025-08-14T00:45:44.523Z
 */
export const display = {
  // Entity metadata
  entityName: 'formPlanImpact',
  tableName: 'api_wf.plans_impacts',
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
        field: 'plan_id',
        headerName: 'Plan_id',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'file_path',
        headerName: 'File_path',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'phase',
        headerName: 'Phase',
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
        field: 'batch_id',
        headerName: 'Batch_id',
        type: '',
        width: 150
      },
      {
        field: 'affected_apps',
        headerName: 'Affected_apps',
        type: '',
        width: 150
      },
      {
        field: 'auto_generated',
        headerName: 'Auto_generated',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'cross_app_analysis',
        headerName: 'Cross_app_analysis',
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
            name: 'plan_id',
            label: 'Plan_id',
            type: '',
            required: true
          },
          {
            name: 'file_path',
            label: 'File_path',
            type: '',
            required: true
          },
          {
            name: 'phase',
            label: 'Phase',
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
            name: 'batch_id',
            label: 'Batch_id',
            type: ''
          },
          {
            name: 'affected_apps',
            label: 'Affected_apps',
            type: ''
          },
          {
            name: 'auto_generated',
            label: 'Auto_generated',
            type: '',
            required: true
          },
          {
            name: 'cross_app_analysis',
            label: 'Cross_app_analysis',
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
    create: { enabled: true, label: 'Add Formplanimpact' },
    view: { enabled: true, label: 'View' }
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