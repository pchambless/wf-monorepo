/**
 * Display Configuration for {{entityName}}
 * Generated from: {{schemaSource}}
 * Generated on: {{generationTimestamp}}
 */

// 🤖 AUTO-GENERATED ZONE - Safe to regenerate
// This section will be automatically updated when entity schemas change
// Do not modify this section directly - changes will be overwritten

/**
 * Auto-generated display configuration for {{entityName}}
 * Generated from: {{schemaSource}}
 * Generated on: {{generationTimestamp}}
 */
export const display = {
  // Entity metadata
  entityName: '{{entityName}}',
  tableName: '{{tableName}}',
  primaryKey: '{{primaryKey}}',
  
  // Grid configuration
  grid: {
    columns: [
      {{#each fields}}
      {
        field: '{{name}}',
        headerName: '{{titleCase name}}',
        type: '{{uiType}}',
        width: {{getDefaultWidth uiType}},
        {{#if (includes validationRules "required")}}
        required: true,
        {{/if}}
        {{#if (eq uiType "datetime")}}
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
        {{/if}}
        {{#if (eq uiType "checkbox")}}
        cellRenderer: 'checkboxRenderer',
        {{/if}}
        editable: true
      }{{#unless @last}},{{/unless}}
      {{/each}}
    ],
    
    // Grid options
    options: {
      pagination: true,
      paginationPageSize: 25,
      sortable: true,
      filter: true,
      resizable: true,
      checkboxSelection: true,
      rowSelection: 'multiple'
    }
  },
  
  // Form configuration
  form: {
    layout: 'vertical',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          {{#each fields}}
          {{#if (lt @index 5)}}
          {
            name: '{{name}}',
            label: '{{titleCase name}}',
            type: '{{uiType}}',
            {{#if (includes validationRules "required")}}
            required: true,
            {{/if}}
            {{#if (includes validationRules "maxLength")}}
            maxLength: {{getMaxLength validationRules}},
            {{/if}}
            placeholder: 'Enter {{titleCase name}}'
          }{{#unless @last}},{{/unless}}
          {{/if}}
          {{/each}}
        ]
      }
      {{#if (gt fields.length 5)}}
      ,{
        title: 'Additional Details',
        fields: [
          {{#each fields}}
          {{#if (gt @index 4)}}
          {
            name: '{{name}}',
            label: '{{titleCase name}}',
            type: '{{uiType}}',
            {{#if (includes validationRules "required")}}
            required: true,
            {{/if}}
            {{#if (includes validationRules "maxLength")}}
            maxLength: {{getMaxLength validationRules}},
            {{/if}}
            placeholder: 'Enter {{titleCase name}}'
          }{{#unless @last}},{{/unless}}
          {{/if}}
          {{/each}}
        ]
      }
      {{/if}}
    ]
  },
  
  // Field definitions with validation
  fields: {
    {{#each fields}}
    {{name}}: {
      type: '{{type}}',
      uiType: '{{uiType}}',
      label: '{{titleCase name}}',
      {{#if (includes validationRules "required")}}
      required: true,
      {{/if}}
      {{#if (includes validationRules "maxLength")}}
      maxLength: {{getMaxLength validationRules}},
      {{/if}}
      validationRules: {{json validationRules}},
      defaultValue: {{#if defaultValue}}'{{defaultValue}}'{{else}}null{{/if}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  }
};

// 🤖 END AUTO-GENERATED ZONE

// ✋ MANUAL CUSTOMIZATION ZONE - Never overwrite
// Add your custom display configurations here
export const customDisplay = {
  // Add your custom configurations here
};
// ✋ END MANUAL CUSTOMIZATION ZONE

export default { ...display, ...customDisplay };