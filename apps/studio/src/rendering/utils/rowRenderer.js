import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';
import React from 'react';

/**
 * Create actions cell with action buttons for a row
 */
function createActionsCell(rowActions, rowData, idx, config, setData) {
  const actionButtons = rowActions.map((action) => ({
    id: `${action.id}_${idx}`,
    type: 'button',
    textContent: action.icon || action.label || action.id,
    style: {
      padding: '4px 8px',
      marginRight: '4px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: action.color === 'error' ? '#dc3545' : '#007bff',
      color: '#fff',
      fontSize: '12px'
    },
    props: {
      title: action.tooltip,
      _onClick: async (e) => {
        e.stopPropagation(); // Don't trigger row selection

        // Handle confirmation if required
        if (action.trigger?.content?.confirm) {
          const confirmMessage = action.trigger.content.confirmMessage || 'Are you sure?';
          if (!window.confirm(confirmMessage)) {
            return;
          }
        }

        console.log(`🔘 Action clicked: ${action.id}`, rowData);

        // Build context with row data
        const context = {
          event: e,
          componentId: action.id,
          rowData: rowData,
          row: rowData,
          pageConfig: config,
          setData
        };

        // Execute the trigger action
        if (action.trigger) {
          // Merge row data into trigger content for DELETE operations
          let triggerContent = action.trigger.content || action.trigger.params || {};

          // For DELETE: ensure we have the row ID
          if (triggerContent.method === 'DELETE') {
            triggerContent = {
              ...triggerContent,
              data: { id: rowData.id, ...triggerContent.data }
            };
          }

          const result = await triggerEngine.executeAction(
            action.trigger.action,
            triggerContent,
            context
          );

          // Execute onSuccess triggers if defined
          if (action.trigger.onSuccess && Array.isArray(action.trigger.onSuccess)) {
            await triggerEngine.executeTriggers(action.trigger.onSuccess, context);
          }

          console.log(`✅ Action ${action.id} completed`, result);
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
    components: actionButtons
  };
}

/**
 * Render row from placeholder, replacing {tokens} with data
 */
export function renderRow(placeholder, rowData, idx, onChangeTriggers, rowKey = 'id', renderComponentFn, config, setData, rowActions = null) {
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

      clonedComp.style = {
        ...(comp.style || {}),
        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f5f5f5',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease'
      };

      clonedComp.props = {
        ...(comp.props || {}),
        _onClick: async (e) => {
          console.log(`🎯 Row clicked: ${rowValue}`, rowData);

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

      // Append actions cell if rowActions are defined
      if (rowActions && rowActions.length > 0) {
        const actionsCell = createActionsCell(rowActions, rowData, idx, config, setData);
        clonedComp.components = [...(clonedComp.components || []), actionsCell];
      }
    }

    return clonedComp;
  };

  return renderComponentFn(cloneWithData(placeholder));
}
