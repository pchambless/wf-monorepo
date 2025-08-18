/**
 * Display Configuration for formPlanComm
 * Generated from: plans/formPlanComm.eventType
 * Generated on: 2025-08-14T00:45:44.499Z
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for formPlanComm
 * Generated from: plans/formPlanComm.eventType
 * Generated on: 2025-08-14T00:45:44.499Z
 */
export const display = {
  // Entity metadata
  entityName: 'formPlanComm',
  tableName: 'api_wf.plans_communications',
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
        field: 'from_agent',
        headerName: 'From_agent',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'to_agent',
        headerName: 'To_agent',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'type',
        headerName: 'Type',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'subject',
        headerName: 'Subject',
        type: '',
        width: 150,
        required: true
      },
      {
        field: 'message',
        headerName: 'Message',
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
            name: 'from_agent',
            label: 'From_agent',
            type: '',
            required: true
          },
          {
            name: 'to_agent',
            label: 'To_agent',
            type: '',
            required: true
          },
          {
            name: 'type',
            label: 'Type',
            type: '',
            required: true
          },
          {
            name: 'subject',
            label: 'Subject',
            type: '',
            required: true
          },
          {
            name: 'message',
            label: 'Message',
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
    create: { enabled: true, label: 'Add Formplancomm' },
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