/**
 * Display Configuration for formPlan
 * Generated from: plans/formPlan.eventType
 * Generated on: 2025-08-14T00:45:44.460Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for formPlan
 * Generated from: plans/formPlan.eventType
 * Generated on: 2025-08-14T00:45:44.460Z
 */
export const display = {
  // Entity metadata
  entityName: 'formPlan',
  tableName: 'api_wf.plans',
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
        field: 'cluster',
        headerName: 'Cluster',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'name',
        headerName: 'Name',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'status',
        headerName: 'Status',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'priority',
        headerName: 'Priority',
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
        field: 'comments',
        headerName: 'Comments',
        type: '',
        width: 150
      },
      {
        field: 'assigned_to',
        headerName: 'Assigned_to',
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
        width: 150,
        required: true
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
            name: 'cluster',
            label: 'Cluster',
            type: '',
            required: true
          },
          {
            name: 'name',
            label: 'Name',
            type: '',
            required: true
          },
          {
            name: 'status',
            label: 'Status',
            type: '',
            required: true
          },
          {
            name: 'priority',
            label: 'Priority',
            type: '',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: ''
          },
          {
            name: 'comments',
            label: 'Comments',
            type: ''
          },
          {
            name: 'assigned_to',
            label: 'Assigned_to',
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
            type: '',
            required: true
          }
        ]
      }
    ]
  },

  // Actions - conditionally generated based on supported operations
  actions: {
    create: { enabled: true, label: 'Add Formplan' },
    view: { enabled: true, label: 'View' },
    edit: { enabled: true, label: 'Edit' }
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