import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';
import React from 'react';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('GridRenderer', 'info');

export const GridComponent = ({ component, renderComponent, contextStore, config, setData }) => {
  const { id, props = {}, workflowTriggers } = component;
  
  // Memoize the onRefresh triggers to prevent unnecessary re-executions
  const onRefreshTriggersRef = React.useRef();
  const hasExecutedRef = React.useRef(false);

  React.useEffect(() => {
    // Only execute onRefresh once per component mount, not on every contextStore change
    if (workflowTriggers?.onRefresh && !hasExecutedRef.current) {
      log.info(`Grid ${id} executing onRefresh triggers (initial load)`);
      const context = {
        pageConfig: config,
        setData,
        componentId: id,
        contextStore
      };
      triggerEngine.executeTriggers(workflowTriggers.onRefresh, context);
      hasExecutedRef.current = true;
      onRefreshTriggersRef.current = workflowTriggers.onRefresh;
    }
  }, [id]); // Only depend on id, not contextStore

  return renderGridContent(component, renderComponent, contextStore, id);
};

const renderGridContent = (component, renderComponent, contextStore, gridId) => {
  const { props = {}, id } = component;

  log.debug(`Rendering Grid ${id}`);

  let columns = props.columns;
  if (typeof columns === 'string') {
    try {
      columns = JSON.parse(columns);
    } catch (e) {
      log.warn('Failed to parse Grid columns:', e);
      columns = [];
    }
  }

  let columnOverrides = props.columnOverrides || {};
  if (typeof columnOverrides === 'string') {
    try {
      columnOverrides = JSON.parse(columnOverrides);
    } catch (e) {
      log.warn('Failed to parse Grid columnOverrides:', e);
      columnOverrides = {};
    }
  }

  const visibleColumns = columns
    .map(col => ({
      ...col,
      ...(columnOverrides[col.name] || {})
    }))
    .filter(col => !col.hidden);

  log.debug(`GridRenderer: ${visibleColumns.length} visible columns:`, visibleColumns.map(c => c.name));

  const tableComponent = {
    id: 'table',
    type: 'table',
    comp_type: 'table',
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid #e0e0e0'
    },
    components: [
      {
        id: 'thead',
        type: 'thead',
        comp_type: 'thead',
        style: {
          backgroundColor: '#f5f5f5'
        },
        components: [
          {
            id: 'headerRow',
            type: 'tr',
            comp_type: 'tr',
            components: visibleColumns.map(col => ({
              id: `header_${col.name}`,
              type: 'th',
              comp_type: 'th',
              textContent: col.label || col.name,
              style: {
                padding: '12px 8px',
                textAlign: 'left',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: '600',
                width: col.width || 'auto'
              }
            }))
          }
        ]
      },
      {
        id: 'tbody',
        type: 'tbody',
        comp_type: 'tbody',
        props: {
          dataSource: id,
          rowKey: 'id',
          selectable: props.selectable || false,
          columns: visibleColumns
        },
        components: [
          {
            id: 'placeholderRow',
            type: 'tr',
            comp_type: 'tr',
            style: {},
            components: visibleColumns.map(col => ({
              id: `placeholder_${col.name}`,
              type: 'td',
              comp_type: 'td',
              textContent: `{${col.name}}`,
              style: {
                padding: '6px 12px',
                borderBottom: '1px solid #e1e4e8',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }))
          }
        ]
      }
    ]
  };

  log.debug(`GridRenderer: Generated table structure for Grid ${id}`);
  return renderComponent(tableComponent);
};

function createActionsCell(rowActions, rowData, idx, config, setData, gridProps) {
  const actionButtons = rowActions.map((action) => ({
    id: `${action.id}_${idx}`,
    type: 'button',
    textContent: action.icon || action.label || action.id,
    style: {
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: action.color === 'error' ? '#dc3545' : '#007bff',
      color: '#fff',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    },
    props: {
      title: action.tooltip,
      _onClick: async (e) => {
        // Don't stop propagation - let row onClick fire first to set context
        
        if (action.confirmMessage) {
          if (!window.confirm(action.confirmMessage)) {
            return;
          }
        }

        log.debug(`Action clicked: ${action.id}`, rowData);

        const context = {
          event: e,
          componentId: action.id,
          rowData: rowData,
          row: rowData,
          props: gridProps,
          pageConfig: config,
          setData
        };

        if (action.trigger) {
          const triggers = Array.isArray(action.trigger) ? action.trigger : [action.trigger];

          const enhancedContext = {
            ...context,
            workflowTriggers: {
              onSuccess: action.onSuccess,
              onError: action.onError
            }
          };

          const processedTriggers = triggers.map(t => {
            let triggerContent = t.content || t.params || {};

            if (triggerContent.method === 'DELETE') {
              triggerContent = {
                ...triggerContent,
                data: { id: rowData.id, ...triggerContent.data }
              };
            }

            return {
              action: t.action,
              params: triggerContent
            };
          });

          await triggerEngine.executeTriggers(processedTriggers, enhancedContext);

          log.debug(`Action ${action.id} completed`);
        }
      }
    }
  }));

  return {
    id: `actions_${idx}`,
    type: 'td',
    style: {
      padding: '6px 12px',
      borderBottom: '1px solid #e1e4e8',
      textAlign: 'center',
      width: '120px'
    },
    components: [{
      id: `actions_container_${idx}`,
      type: 'div',
      style: {
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center'
      },
      components: actionButtons
    }]
  };
}

export function renderRow(placeholder, rowData, idx, onChangeTriggers, rowKey = 'id', renderComponentFn, config, setData, rowActions = null, gridProps = null, selectedRowId = null, setSelectedRowId = null, expansionStyles = null) {
  const cloneWithData = (comp) => {
    let textContent = comp.textContent;

    if (textContent && textContent.includes('{')) {
      Object.entries(rowData).forEach(([field, value]) => {
        textContent = textContent.replace(`{${field}}`, value);
      });
    }

    const clonedComp = {
      ...comp,
      id: `${comp.id}_${idx}`,
      key: `${comp.id}_${idx}`,
      textContent,
      components: comp.components?.map(child => cloneWithData(child))
    };

    if (comp.type === 'tr' && onChangeTriggers) {
      const rowValue = rowData[rowKey];
      const isSelected = selectedRowId === rowValue;

      const baseStyle = isSelected && expansionStyles?.trSelected
        ? expansionStyles.trSelected
        : {
            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f5f5f5',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          };

      clonedComp.style = {
        ...(comp.style || {}),
        ...baseStyle
      };

      clonedComp.props = {
        ...(comp.props || {}),
        _onClick: async (e) => {
          log.debug(`Row clicked: ${rowValue}`, rowData);

          if (setSelectedRowId) {
            setSelectedRowId(rowValue);
          }

          const context = {
            event: e,
            componentId: comp.id,
            this: { value: rowValue },
            selected: rowData,
            rowData: rowData,
            pageConfig: config,
            setData,
            workflowTriggers: { onChange: onChangeTriggers }
          };

          await triggerEngine.executeTriggers(onChangeTriggers, context);
        }
      };

      if (rowActions && rowActions.length > 0 && gridProps) {
        const actionsCell = createActionsCell(rowActions, rowData, idx, config, setData, gridProps);
        clonedComp.components = [...(clonedComp.components || []), actionsCell];
      }
    }

    return clonedComp;
  };

  return renderComponentFn(cloneWithData(placeholder));
}
