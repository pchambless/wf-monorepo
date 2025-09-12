/**
 * SelectRenderer - Pure select component with CSS classes
 * 
 * Renders HTML select with WorkflowEngine integration
 * No business logic - just structure + events
 */

import React, { useState, useEffect } from "react";
import { useContextStore } from "@whatsfresh/shared-imports";

const SelectRenderer = ({ component, data = [], onEvent }) => {
  const { id, props } = component;
  const [selected, setSelected] = useState("");
  const contextStore = useContextStore();

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelected(value);

    // Store selection in contextStore for other components to read
    contextStore.setVal(id, value);

    // Find the selected item for context
    const selectedItem = data.find(
      (item) => item.id === value || item.value === value
    );

    // Fire unified onChange event to WorkflowEngine
    if (onEvent) {
      onEvent('onChange', {
        value,
        selectedItem,
        component,
      });
    }
  };

  return (
    <div style={props?.style}>
      {props?.title && (
        <label className="wf-label">{props.title}</label>
      )}
      
      <select 
        className="wf-select"
        value={selected}
        onChange={handleSelectChange}
        disabled={!data || data.length === 0}
      >
        <option value="">
          {(!data || data.length === 0) 
            ? "Loading..." 
            : `Select ${props?.title || 'option'}...`
          }
        </option>
        {data.map((item, index) => (
          <option 
            key={item.id || item.value || index} 
            value={item.id || item.value}
          >
            {item.name || item.label || item.title || item.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectRenderer;