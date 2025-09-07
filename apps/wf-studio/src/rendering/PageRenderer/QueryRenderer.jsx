/**
 * QueryRenderer - Handles data-driven leaf components
 * 
 * Renders select, form, grid components that have:
 * - workflowTriggers (onRefresh, onChange, etc.)  
 * - qry (data binding)
 * - fields (data schema)
 */

import React, { useState, useEffect } from 'react';
import { workflowEngine } from '../WorkflowEngine';

const QueryRenderer = ({ eventType, componentKey }) => {
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Execute onRefresh workflow trigger on mount
    if (eventType.workflowTriggers?.onRefresh) {
      executeWorkflow('onRefresh');
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Common workflow execution pattern for all query-based leafs
   */
  const executeWorkflow = async (triggerName, contextData = {}) => {
    try {
      const triggers = eventType.workflowTriggers[triggerName];
      if (!Array.isArray(triggers)) return;

      for (const trigger of triggers) {
        if (typeof trigger === 'string') {
          // Simple workflow method call (execApps, execPages)
          const result = await workflowEngine.executeAction({ action: trigger }, contextData);
          if (result && (trigger.includes('exec') || trigger.includes('load'))) {
            setData(result);
            setLoading(false);
          }
        } else {
          // Complex workflow action object
          await workflowEngine.executeAction(trigger, contextData);
        }
      }
    } catch (error) {
      console.error(`Error executing ${triggerName} workflow:`, error);
      setLoading(false);
    }
  };

  /**
   * Handle user interactions - execute onChange workflows
   */
  const handleChange = (value) => {
    setSelectedValue(value);
    
    // Execute onChange workflow triggers
    if (eventType.workflowTriggers?.onChange) {
      executeWorkflow('onChange', { value, selectedValue: value });
    }
  };

  /**
   * Render UI based on leaf category/type
   */
  const renderUI = () => {
    const category = eventType.category || eventType.type;
    
    switch (category) {
      case 'select':
        return renderSelect();
      case 'form':
        return renderForm();
      case 'grid':
        return renderGrid();
      default:
        return renderGeneric();
    }
  };

  const renderSelect = () => (
    <div style={{ marginBottom: "12px" }}>
      <strong>{eventType.title || eventType.props?.title}:</strong>
      <div style={{ marginTop: "4px" }}>
        <select
          style={{ width: "100%", padding: "4px" }}
          value={selectedValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
        >
          {loading ? (
            <option>Loading...</option>
          ) : (
            <>
              <option value="">{eventType.placeholder || 'Select...'}</option>
              {data.map(option => {
                const value = eventType.valueKey ? option[eventType.valueKey] : (option.id || option);
                const label = eventType.labelKey ? option[eventType.labelKey] : (option.name || option.label || option);
                return (
                  <option key={value} value={value}>{label}</option>
                );
              })}
            </>
          )}
        </select>
      </div>
    </div>
  );

  const renderForm = () => (
    <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "4px" }}>
      <h4>{eventType.title}</h4>
      <p>Form fields would render here based on eventType.fields</p>
      {/* TODO: Implement form field rendering */}
    </div>
  );

  const renderGrid = () => (
    <div style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "4px" }}>
      <h4>{eventType.title}</h4>
      <p>Grid/table would render here based on eventType.fields and data</p>
      {/* TODO: Implement grid rendering */}
    </div>
  );

  const renderGeneric = () => (
    <div style={{ padding: "16px", border: "1px dashed #ccc", borderRadius: "4px" }}>
      <h4>{eventType.title || eventType.id}</h4>
      <p>Query-based component: {eventType.category || eventType.type}</p>
      <p>Workflow triggers: {Object.keys(eventType.workflowTriggers || {}).join(', ')}</p>
    </div>
  );

  return renderUI();
};

export default QueryRenderer;