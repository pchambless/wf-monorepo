/**
 * GridRenderer - Grid/table component with CSS classes
 */

import React, { useState, useEffect } from "react";
import { useContextStore } from "@whatsfresh/shared-imports";

const GridRenderer = ({ component, onEvent }) => {
  const { id, props } = component;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const contextStore = useContextStore();

  // Listen for data updates from WorkflowEngine
  useEffect(() => {
    const dataKey = `${id}_data`;
    const currentData = contextStore.getVal(dataKey);
    if (currentData && Array.isArray(currentData)) {
      setData(currentData);
    }

    // Subscribe to future data updates
    const unsubscribe = contextStore.subscribe?.(dataKey, (newData) => {
      if (Array.isArray(newData)) {
        setData(newData);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, contextStore]);

  const handleRowClick = (row, rowIndex) => {
    if (onEvent) {
      onEvent('onChange', { row, rowIndex, component });
    }
  };

  const fields = props?.fields || [];

  return (
    <div style={props?.style}>
      {props?.title && <h3 className="wf-title">{props.title}</h3>}
      
      <table className="wf-grid">
        <thead>
          <tr>
            {fields.map((field, index) => (
              <th key={field.name || index}>
                {field.label || field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={fields.length} style={{ textAlign: "center", padding: "16px" }}>
                Loading...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {fields.map((field, fieldIndex) => (
                  <td key={fieldIndex}>
                    {row[field.name] || '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={fields.length} style={{ textAlign: "center", padding: "16px", color: "#666" }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GridRenderer;