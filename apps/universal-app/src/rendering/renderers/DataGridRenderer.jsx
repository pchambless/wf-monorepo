import React from 'react';
import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';

/**
 * Bulletproof Grid Component Renderer
 * Handles Grid comp_type components with data loading and table rendering
 */
export const renderDataGrid = (component, dataStore, setData, config) => {
  const { id, props = {}, workflowTriggers } = component;
  
  // Parse columns and columnOverrides safely
  let columns = [];
  let columnOverrides = {};
  
  try {
    columns = typeof props.columns === 'string' ? JSON.parse(props.columns) : (props.columns || []);
    columnOverrides = typeof props.columnOverrides === 'string' ? JSON.parse(props.columnOverrides) : (props.columnOverrides || {});
  } catch (e) {
    console.error(`❌ Failed to parse Grid props for ${id}:`, e);
    return <div style={{ color: 'red', padding: '16px' }}>Error: Invalid Grid configuration</div>;
  }

  // Get data for this grid
  const gridData = dataStore[id] || [];
  
  // Filter visible columns
  const visibleColumns = columns.filter(col => !columnOverrides[col.name]?.hidden);
  
  // Execute onRefresh triggers when component mounts
  React.useEffect(() => {
    if (workflowTriggers?.onRefresh) {
      console.log(`🔄 Grid ${id}: Executing onRefresh triggers`);
      const context = {
        pageConfig: config,
        setData,
        componentId: id
      };
      
      triggerEngine.executeTriggers(workflowTriggers.onRefresh, context)
        .catch(err => {
          console.error(`❌ Grid ${id}: onRefresh trigger failed:`, err);
        });
    }
  }, [id, workflowTriggers, config, setData]);

  // Stable styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e1e4e8',
    backgroundColor: '#fff',
    fontSize: '14px'
  };

  const headerStyle = {
    backgroundColor: '#f6f8fa',
    padding: '8px 12px',
    borderBottom: '1px solid #e1e4e8',
    textAlign: 'left',
    fontWeight: '600',
    color: '#24292e'
  };

  const cellStyle = {
    padding: '8px 12px',
    borderBottom: '1px solid #e1e4e8',
    verticalAlign: 'top'
  };

  const actionButtonStyle = {
    padding: '4px 8px',
    margin: '0 2px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  };

  // Render action buttons if rowActions exist
  const renderActionButtons = (rowData, rowIndex) => {
    if (!props.rowActions) return null;
    
    let rowActions = [];
    try {
      rowActions = typeof props.rowActions === 'string' ? JSON.parse(props.rowActions) : props.rowActions;
    } catch (e) {
      console.error(`❌ Failed to parse rowActions for Grid ${id}:`, e);
      return <span style={{ color: 'red' }}>Invalid actions</span>;
    }

    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {rowActions.map((action, actionIndex) => (
          <button
            key={`${action.id}_${rowIndex}_${actionIndex}`}
            style={{
              ...actionButtonStyle,
              backgroundColor: action.color === 'error' ? '#dc3545' : '#007bff',
              color: '#fff'
            }}
            title={action.tooltip}
            onClick={() => {
              console.log(`🔘 Action ${action.id} clicked for row:`, rowData);
              // Action handling will be implemented later
            }}
          >
            {action.icon || action.label || action.id}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div key={id} style={{ width: '100%', overflow: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {visibleColumns.map(col => {
              const override = columnOverrides[col.name] || {};
              return (
                <th 
                  key={col.name} 
                  style={{
                    ...headerStyle,
                    width: override.width || 'auto'
                  }}
                >
                  {override.label || col.name}
                </th>
              );
            })}
            {props.rowActions && <th style={headerStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {gridData.length > 0 ? (
            gridData.map((row, idx) => (
              <tr 
                key={row.id || idx} 
                style={{ 
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f3ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9f9f9';
                }}
              >
                {visibleColumns.map(col => (
                  <td key={col.name} style={cellStyle}>
                    {row[col.name] || ''}
                  </td>
                ))}
                {props.rowActions && (
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    {renderActionButtons(row, idx)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={visibleColumns.length + (props.rowActions ? 1 : 0)} 
                style={{ 
                  ...cellStyle, 
                  textAlign: 'center', 
                  color: '#666',
                  fontStyle: 'italic',
                  padding: '24px'
                }}
              >
                {gridData === undefined ? 'Loading...' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default renderDataGrid;