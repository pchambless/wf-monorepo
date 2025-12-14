import React from 'react';
import { renderContainer } from './ContainerRenderer';
import { triggerEngine } from '../WorkflowEngine/TriggerEngine';
import { createLogger } from '../../utils/logger.js';
import { SelectComponent } from './SelectRenderer.jsx';
import { parseColPos, buildEventTypeRegistry } from '../utils/colPosParser';

const log = createLogger('FormRenderer', 'debug');

/**
 * Form Component - Wraps form rendering with lifecycle hooks
 */
const FormComponent = React.memo(({ component, renderComponent, contextStore, config, setData, eventTypeConfig = {} }) => {
  const { id, workflowTriggers } = component;
  const [formData, setFormData] = React.useState({});

  log.info('🎯 FormComponent received eventTypeConfig:', {
    isObject: typeof eventTypeConfig === 'object',
    keys: Object.keys(eventTypeConfig || {}),
    keysCount: Object.keys(eventTypeConfig || {}).length,
    sample: eventTypeConfig?.SelMeasure || eventTypeConfig?.H4 || 'no SelMeasure or H4'
  });

  const eventTypeRegistry = React.useMemo(() => buildEventTypeRegistry(eventTypeConfig), [eventTypeConfig]);

  // Execute onRefresh triggers when form mounts (only on id change, not contextStore)
  React.useEffect(() => {
    if (workflowTriggers?.onRefresh) {
      log.debug(`Form ${id} executing onRefresh triggers`);
      const context = {
        pageConfig: config,
        setData,
        componentId: id,
        contextStore
      };
      triggerEngine.executeTriggers(workflowTriggers.onRefresh, context);
    }
  }, [id]); // Removed contextStore from dependencies to prevent constant re-renders

  const handleFieldChange = React.useCallback((fieldName, value) => {
    log.debug(`Form ${id} field changed: ${fieldName} = ${value}`);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, [id]);

  return renderFormContent(component, renderComponent, contextStore, id, formData, handleFieldChange, eventTypeRegistry);
});

/**
 * FormRenderer - Auto-generates form fields from columns prop
 *
 * Forms in the CRUD template have a columns prop that defines the fields.
 * This renderer generates input components from that schema before rendering children.
 */
const renderFormContent = (component, renderComponent, contextStore, parentFormId, formData = {}, handleFieldChange, eventTypeRegistry = {}) => {
  const { props = {}, components = [], id } = component;

  log.debug(`Rendering form ${id}, ${components.length} children:`, components.map(c => `${c.comp_type}:${c.id}`));
  
  // Parse columns if it's a JSON string
  let columns = props.columns;
  if (typeof columns === 'string') {
    try {
      columns = JSON.parse(columns);
    } catch (e) {
      log.warn('Failed to parse Form columns:', e);
      columns = [];
    }
  }

  // Parse columnOverrides if it's a JSON string
  let columnOverrides = props.columnOverrides || {};
  if (typeof columnOverrides === 'string') {
    try {
      columnOverrides = JSON.parse(columnOverrides);
    } catch (e) {
      log.warn('Failed to parse columnOverrides:', e);
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

      // Parse colPos if available, otherwise use individual properties
      const posConfig = override.colPos
        ? parseColPos(override.colPos, eventTypeRegistry)
        : {};

      log.debug(`🔍 FormRenderer field ${column.name}:`, {
        colPos: override.colPos,
        posConfig,
        eventTypeRegistrySize: Object.keys(eventTypeRegistry).length
      });
      log.debug(`Field ${column.name}: colPos=${override.colPos}, posConfig=`, posConfig);

      // Determine input type (colPos > override.type > column.type > 'text')
      const inputType = posConfig.type || override.type || column.inputType || column.type || 'text';
      const comp_type = inputType === 'select' ? 'select' :
                        inputType === 'textarea' ? 'textarea' : 'input';

      // Determine row and column position (colPos > override > default)
      const row = posConfig.row || override.row || Math.floor(index / 2) + 1;
      const colIndex = index % 2;
      const col = posConfig.col || override.col || (colIndex + 1);
      const colSpan = posConfig.colSpan || override.colSpan || (inputType === 'textarea' ? 2 : 1);

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
          // Input or Select
          comp_type === 'select' ? {
            id: `${id}-input-${column.name}`,
            xref_id: `${id}-input-${column.name}`,
            comp_type: 'select',
            comp_name: column.name,
            props: {
              name: column.name,
              eventType: override.eventType || column.eventType,
              // Pull from posConfig (derived from eventType) with override fallbacks
              qryName: posConfig.qryName || override.qryName || column.qryName,
              contextKey: override.contextKey || posConfig.contextKey || column.contextKey || column.name,
              required: override.required || column.nullable === 'NO',
              placeholder: override.placeholder || posConfig.placeholder || `Select ${labelText}...`,
              valueKey: override.valueKey || posConfig.valueKey || 'value',
              labelKey: override.labelKey || posConfig.labelKey || 'label'
            },
            override_styles: {
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            },
            components: [],
            workflowTriggers: null
          } : {
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

  log.debug(`Generated ${generatedInputs.length} inputs, ${components.length} existing children`);

  // Create enhanced component with generated inputs
  const enhancedComponent = {
    ...component,
    components: allChildren
  };

  // Create actual HTML form element with proper id for captureFormData
  const formId = component.comp_name || id; // Use comp_name (e.g., "Form") as the DOM id
  
  // Apply styles from component
  const formStyles = {
    ...component.override_styles,
    ...component.style,
  };

  // Use ContainerRenderer to render the form children
  const renderChildWithFormId = (child) => renderComponent(child, formId);
  const formChildren = renderContainer(enhancedComponent, renderChildWithFormId);

  // Return actual HTML form element wrapping the children
  return React.createElement('form', {
    id: formId,
    key: formId,
    style: formStyles,
  }, formChildren);
};

export { FormComponent, renderFormContent as renderForm };
