import React from 'react';
import { renderContainer } from './ContainerRenderer';
import { triggerEngine } from '../WorkflowEngine/TriggerEngine';

/**
 * Form Component - Wraps form rendering with lifecycle hooks
 */
const FormComponent = ({ component, renderComponent, contextStore, config, setData }) => {
  const { id, workflowTriggers } = component;

  // Execute onRefresh triggers when form mounts
  React.useEffect(() => {
    if (workflowTriggers?.onRefresh) {
      console.log(`🔄 Form ${id} executing onRefresh triggers`);
      const context = {
        pageConfig: config,
        setData,
        componentId: id,
        contextStore
      };
      triggerEngine.executeTriggers(workflowTriggers.onRefresh, context);
    }
  }, [id]);

  return renderFormContent(component, renderComponent, contextStore, id);
};

/**
 * FormRenderer - Auto-generates form fields from columns prop
 *
 * Forms in the CRUD template have a columns prop that defines the fields.
 * This renderer generates input components from that schema before rendering children.
 */
const renderFormContent = (component, renderComponent, contextStore, formId) => {
  const { props = {}, components = [], id } = component;

  console.log(`📋 FormRenderer: Rendering form ${id}, passing formId=${formId || id} to children`);
  
  // Parse columns if it's a JSON string
  let columns = props.columns;
  if (typeof columns === 'string') {
    try {
      columns = JSON.parse(columns);
    } catch (e) {
      console.warn('Failed to parse Form columns:', e);
      columns = [];
    }
  }

  // Parse columnOverrides if it's a JSON string
  let columnOverrides = props.columnOverrides || {};
  if (typeof columnOverrides === 'string') {
    try {
      columnOverrides = JSON.parse(columnOverrides);
    } catch (e) {
      console.warn('Failed to parse columnOverrides:', e);
      columnOverrides = {};
    }
  }

  // Generate input components from columns
  const generatedInputs = [];
  if (Array.isArray(columns)) {
    columns.forEach((column, index) => {
      const override = columnOverrides[column.name] || {};
      
      // Skip hidden fields
      if (override.hidden) {
        return;
      }

      // Determine input type
      const inputType = column.inputType || 'text';
      const comp_type = inputType === 'textarea' ? 'textarea' : 'input';

      // Determine row and column position
      const row = override.row || Math.floor(index / 2) + 1; // 2 columns per row by default
      const colIndex = index % 2;
      const col = colIndex + 1;
      const colSpan = override.colSpan || (inputType === 'textarea' ? 2 : 1);

      // Create label + input wrapper
      const labelText = override.label || column.name;
      const fieldWrapper = {
        id: `${id}-field-${column.name}`,
        xref_id: `${id}-field-${column.name}`,
        comp_type: 'div',
        comp_name: `${column.name}-wrapper`,
        props: {
          col: col,
          colSpan: colSpan,
        },
        position: {
          row: row,
          order: col,
          align: 'left'
        },
        override_styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          width: '100%'
        },
        components: [
          // Label
          {
            id: `${id}-label-${column.name}`,
            comp_type: 'label',
            props: {
              htmlFor: `${id}-input-${column.name}`,
            },
            override_styles: {
              fontWeight: '600',
              fontSize: '14px',
              color: '#333'
            },
            textContent: labelText + (override.required || column.nullable === 'NO' ? ' *' : ''),
            components: []
          },
          // Input
          {
            id: `${id}-input-${column.name}`,
            xref_id: `${id}-input-${column.name}`,
            comp_type: comp_type,
            comp_name: column.name,
            props: {
              name: column.name,
              type: inputType === 'textarea' ? undefined : inputType,
              required: override.required || column.nullable === 'NO',
              placeholder: override.placeholder || `Enter ${labelText}`,
            },
            override_styles: {
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            },
            components: [],
            workflowTriggers: null
          }
        ],
        workflowTriggers: null
      };

      generatedInputs.push(fieldWrapper);
    });
  }

  // Merge generated inputs with existing children (like Submit button)
  const allChildren = [...generatedInputs, ...components];

  // Create enhanced component with generated inputs
  const enhancedComponent = {
    ...component,
    components: allChildren
  };

  // Use ContainerRenderer to render the form with all children
  // Pass formId to children so inputs can read from dataStore[formId]
  const renderChildWithFormId = (child) => renderComponent(child, formId || id);
  return renderContainer(enhancedComponent, renderChildWithFormId);
};

export { FormComponent, renderFormContent as renderForm };
