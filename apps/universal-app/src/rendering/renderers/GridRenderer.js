import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';
import React from 'react';

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

        console.log(`🔘 Action clicked: ${action.id}`, rowData);

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

          console.log(`✅ Action ${action.id} completed`);
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
          console.log(`🎯 Row clicked: ${rowValue}`, rowData);

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
