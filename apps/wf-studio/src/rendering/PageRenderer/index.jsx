/**
 * 🚀 PageRenderer - Dynamic Page Orchestrator
 * 
 * Renders exactly what the pageConfig describes - no assumptions, no hardcoding
 */

import React, { useState, useEffect } from 'react';
import { workflowEngine } from '../WorkflowEngine/index.js';
import { useContextStore } from '@whatsfresh/shared-imports';

const PageRenderer = ({ config }) => {
  const contextStore = useContextStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize WorkflowEngine
    workflowEngine.initialize(contextStore);
    
    // Execute page-level onLoad workflow triggers if they exist
    if (config?.workflowTriggers?.onLoad) {
      console.log('🚀 Executing page onLoad workflow:', config.workflowTriggers.onLoad);
      
      // Execute action-target workflow pattern
      const { action, targets } = config.workflowTriggers.onLoad;
      if (action && targets) {
        workflowEngine.execTargetAction(action, targets, { config, contextStore });
      }
    }
    
    setLoading(false);
  }, [config]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>No config provided</div>;
  }

  // Build layout based on config.layout
  return <LayoutRenderer config={config} />;
};

/**
 * Layout Renderer - builds layout structure from config
 */
const LayoutRenderer = ({ config }) => {
  const { layout, components = [] } = config;

  // Create layout container styles
  const containerStyle = getLayoutContainerStyle(layout);

  return (
    <div style={containerStyle}>
      {components.map((component, index) => (
        <ComponentWrapper key={component.id || index} component={component}>
          <ComponentRenderer component={component} />
        </ComponentWrapper>
      ))}
    </div>
  );
};

/**
 * Component Wrapper - applies positioning and sizing from config
 */
const ComponentWrapper = ({ component, children }) => {
  const style = {
    width: component.width,
    flex: component.flex,
    backgroundColor: component.props?.style?.backgroundColor,
    borderRight: component.props?.style?.borderRight,
    padding: component.props?.style?.padding,
    overflow: "auto"
  };

  return <div style={style}>{children}</div>;
};

/**
 * Component Renderer - renders based on component.type (generic, no hardcoding)
 */
const ComponentRenderer = ({ component }) => {
  const { type, id, title, props, components = [] } = component;

  // Execute any workflow triggers for this component
  useEffect(() => {
    if (component.workflowTriggers?.onMount) {
      component.workflowTriggers.onMount.forEach(workflow => {
        workflowEngine.executeWorkflow(workflow, { component, contextStore });
      });
    }
  }, [component]);

  switch (type) {
    case "sidebar":
      return <GenericSidebar component={component} />;

    case "column":  
      return <GenericColumn component={component} />;

    case "tabs":
      return <GenericTabs component={component} />;

    case "section":
      return <GenericSection component={component} />;

    case "modal":
      return <GenericModal component={component} />;

    case "form":
      return <GenericForm component={component} />;

    case "grid":
      return <GenericGrid component={component} />;

    default:
      return (
        <div style={{ padding: "16px" }}>
          <h4>{title || id}</h4>
          <p>Component type: {type}</p>
          <p>Component ID: {id}</p>
          {/* Render child components if they exist */}
          {components.length > 0 && (
            <div>
              {components.map((child, index) => (
                <ComponentRenderer key={child.id || index} component={child} />
              ))}
            </div>
          )}
        </div>
      );
  }
};

/**
 * Get layout container styles based on layout type
 */
const getLayoutContainerStyle = (layout) => {
  switch (layout) {
    case "three-column":
      return {
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif"
      };

    case "two-column":
      return {
        display: "flex",
        height: "100vh"
      };

    case "grid":
      return {
        display: "grid",
        height: "100vh"
      };

    default:
      return {
        display: "flex",
        height: "100vh"
      };
  }
};

/**
 * Generic Sidebar Component
 */
const GenericSidebar = ({ component }) => {
  const contextStore = useContextStore();
  const [selectedApp, setSelectedApp] = React.useState('studio');
  const [selectedPage, setSelectedPage] = React.useState('');
  const [availableApps, setAvailableApps] = React.useState(['studio']);
  const [availablePages, setAvailablePages] = React.useState({ studio: [] });
  const [loading, setLoading] = React.useState(true);

  // Discovery now handled by select widgets via WorkflowEngine
  React.useEffect(() => {
    setLoading(false);
  }, []);

  const eventTypeHierarchy = {
    plans: {
      PlanManager: {
        forms: ['formPlan', 'formPlanComm', 'formPlanImpact'],
        grids: ['gridPlans', 'gridPlanComms', 'gridPlanImpacts'],
        tabs: ['tabPlan', 'tabPlanComms', 'tabPlanImpacts'],
        widgets: ['btnCreate', 'selectPlanStatus']
      }
    }
  };

  const handleAppChange = (appName) => {
    setSelectedApp(appName);
    setSelectedPage(availablePages[appName]?.[0] || null);
    contextStore.setVal('appName', appName);
    contextStore.setVal('pageName', availablePages[appName]?.[0] || null);
    contextStore.setVal('eventName', null);
  };

  const handlePageChange = (pageName) => {
    setSelectedPage(pageName);
    contextStore.setVal('selectedPage', pageName);
    contextStore.setVal('selectedEventType', null);
  };

  const handleEventTypeClick = (eventTypeName) => {
    contextStore.setVal('selectedEventType', eventTypeName);
    console.log('Selected eventType:', eventTypeName);
  };

  const handleGeneratePageConfig = async (appName, pageName) => {
    console.log(`🚀 Generating pageConfig for ${appName}/${pageName}...`);

    try {
      // Use WorkflowEngine to trigger genPageConfig workflow
      const result = await workflowEngine.executeWorkflow('genPageConfig', { 
        appName, 
        pageName,
        contextStore 
      });

      if (result.success) {
        console.log('✅ Successfully generated pageConfig.json');
        alert(`✅ Generated pageConfig for ${appName}/${pageName}\n\nComponents: ${result.components?.length || 0}`);
      } else {
        throw new Error(result.error || 'Unknown error');
      }

    } catch (error) {
      console.error('❌ Error generating pageConfig:', error);
      alert(`❌ Failed to generate pageConfig for ${appName}/${pageName}\n\nError: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h3 style={{ margin: "0 0 16px 0" }}>
        {component.props?.title || "Sidebar"}
      </h3>

      {/* App Selector */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "12px",
        marginBottom: "12px"
      }}>
        <strong>Select App:</strong>
        <div style={{ marginTop: "4px" }}>
          <select
            style={{ width: "100%", padding: "4px" }}
            value={selectedApp}
            onChange={(e) => handleAppChange(e.target.value)}
            disabled={loading}
          >
            {loading ? (
              <option>Loading apps...</option>
            ) : (
              availableApps.map(app => (
                <option key={app} value={app}>{app.charAt(0).toUpperCase() + app.slice(1)}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Page List */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "12px",
        marginBottom: "12px"
      }}>
        <strong>Page List (select):</strong>
        <div style={{ marginTop: "4px", display: "flex", gap: "4px" }}>
          <select
            style={{ flex: 1, padding: "4px" }}
            value={selectedPage || ''}
            onChange={(e) => handlePageChange(e.target.value)}
          >
            <option value="">Select page...</option>
            {availablePages[selectedApp]?.map(page => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
          {selectedPage && (
            <button
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer"
              }}
              onClick={() => handleGeneratePageConfig(selectedApp, selectedPage)}
              title={`Generate pageConfig for ${selectedApp}/${selectedPage}`}
            >
              ⚙️ Generate
            </button>
          )}
        </div>
      </div>

      {/* EventType Hierarchy */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "12px"
      }}>
        <strong>Accordion List of eventTypes:</strong>
        <div style={{ marginTop: "8px", fontSize: "12px" }}>
          {selectedPage && eventTypeHierarchy[selectedApp]?.[selectedPage] && (
            <details open>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Page: {selectedPage}</summary>
              <div style={{ marginLeft: "12px", marginTop: "4px" }}>
                {Object.entries(eventTypeHierarchy[selectedApp][selectedPage]).map(([category, eventTypes]) => (
                  <details key={category} open>
                    <summary style={{ cursor: "pointer", color: "#333" }}>-- {category}</summary>
                    <div style={{ marginLeft: "12px", marginTop: "4px" }}>
                      {eventTypes.map(eventType => (
                        <div
                          key={eventType}
                          style={{
                            cursor: "pointer",
                            padding: "2px 4px",
                            color: "#0066cc",
                            borderRadius: "2px"
                          }}
                          onClick={() => handleEventTypeClick(eventType)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {eventType}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Generic Column Component
 */
const GenericColumn = ({ component }) => {
  const { title, id, props, components = [] } = component;
  
  return (
    <div style={{ padding: "16px", ...props?.style }}>
      <h3>{title || id}</h3>
      {/* Render child components if they exist */}
      {components.length > 0 && (
        <div>
          {components.map((child, index) => (
            <ComponentRenderer key={child.id || index} component={child} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Generic Tabs Component
 */
const GenericTabs = ({ component }) => {
  const { title, id, props, components = [] } = component;
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div style={{ padding: "16px", ...props?.style }}>
      <h3>{props?.title || title || "Tabs"}</h3>
      {/* Tab Headers */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "16px" }}>
        {components.map((tab, index) => (
          <button 
            key={tab.id || index}
            style={{ 
              padding: "8px 16px",
              backgroundColor: activeTab === index ? '#f0f0f0' : 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(index)}
          >
            {tab.title || tab.id || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      {/* Active Tab Content */}
      <div>
        {components[activeTab] ? (
          <ComponentRenderer component={components[activeTab]} />
        ) : (
          <p>No tab content</p>
        )}
      </div>
    </div>
  );
};

/**
 * Generic Section Component
 */
const GenericSection = ({ component }) => {
  const { title, id, props, components = [] } = component;
  
  return (
    <div style={{ padding: "16px", ...props?.style }}>
      {title && <h3>{title}</h3>}
      {components.map((child, index) => (
        <ComponentRenderer key={child.id || index} component={child} />
      ))}
    </div>
  );
};

/**
 * Generic Modal Component (placeholder)
 */
const GenericModal = ({ component }) => {
  const { title, id, props, components = [] } = component;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 1000,
      ...props?.style 
    }}>
      <h3>{title || id}</h3>
      {components.map((child, index) => (
        <ComponentRenderer key={child.id || index} component={child} />
      ))}
    </div>
  );
};

/**
 * Generic Form Component (placeholder)
 */
const GenericForm = ({ component }) => {
  const { title, id, props, fields = [] } = component;
  
  return (
    <div style={{ padding: "16px", ...props?.style }}>
      <h3>{title || id}</h3>
      <form>
        {fields.map((field, index) => (
          <div key={field.name || index} style={{ marginBottom: "12px" }}>
            <label>{field.label || field.name}</label>
            <input 
              type={field.type || "text"}
              placeholder={field.placeholder}
              style={{ width: "100%", padding: "4px" }}
            />
          </div>
        ))}
      </form>
    </div>
  );
};

/**
 * Generic Grid Component (placeholder)
 */
const GenericGrid = ({ component }) => {
  const { title, id, props, fields = [], data = [] } = component;
  
  return (
    <div style={{ padding: "16px", ...props?.style }}>
      <h3>{title || id}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {fields.map((field, index) => (
              <th key={field.name || index} style={{ border: "1px solid #ddd", padding: "8px" }}>
                {field.label || field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, index) => (
            <tr key={index}>
              {fields.map((field, fieldIndex) => (
                <td key={fieldIndex} style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {row[field.name] || '-'}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={fields.length} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PageRenderer;