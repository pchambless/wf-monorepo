/**
 * 🚀 PageRenderer - Dynamic Page Orchestrator
 * 
 * Renders exactly what the pageConfig describes - no assumptions, no hardcoding
 */

import React, { useState, useEffect } from 'react';
import { workflowEngine } from '../workflows/WorkflowEngine';
import { useContextStore } from '@whatsfresh/shared-imports';

const PageRenderer = ({ config }) => {
  const contextStore = useContextStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize WorkflowEngine
    workflowEngine.initialize(contextStore);
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
 * Component Renderer - renders based on component.category
 */
const ComponentRenderer = ({ component }) => {
  const { category, id, title, props } = component;

  switch (category) {
    case "column":
      if (id === "studioSidebar") {
        return <StudioSidebar component={component} />;
      }
      if (id === "componentChoicesPanel") {
        return <ComponentChoicesPanel component={component} />;
      }
      return <GenericColumn component={component} />;

    case "tabs":
      return <TabsRenderer component={component} />;

    default:
      return (
        <div style={{ padding: "16px" }}>
          <h4>{title || id}</h4>
          <p>Component category: {category}</p>
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
 * Studio Sidebar Component
 */
const StudioSidebar = ({ component }) => {
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
    import('../stores/studioStore.js').then(({ setVal }) => {
      setVal('selectedApp', appName);
      setVal('selectedPage', availablePages[appName]?.[0] || null);
      setVal('selectedEventType', null);
    });
  };

  const handlePageChange = (pageName) => {
    setSelectedPage(pageName);
    import('../stores/studioStore.js').then(({ setVal }) => {
      setVal('selectedPage', pageName);
      setVal('selectedEventType', null);
    });
  };

  const handleEventTypeClick = (eventTypeName) => {
    import('../stores/studioStore.js').then(({ setVal }) => {
      setVal('selectedEventType', eventTypeName);
    });
    console.log('Selected eventType:', eventTypeName);
  };

  const handleGeneratePageConfig = async (appName, pageName) => {
    console.log(`🚀 Generating pageConfig for ${appName}/${pageName}...`);
    
    try {
      // Import the generator
      const { genPageConfig } = await import('../utils/genPageConfig.js');
      
      // Import eventTypeDiscovery to find all eventTypes for this page
      const { getPageEventTypes } = await import('../utils/eventTypeDiscovery.js');
      
      // Get all eventTypes for the selected page
      const eventTypes = await getPageEventTypes(appName, pageName);
      console.log(`📋 Found ${eventTypes.length} eventTypes for ${appName}/${pageName}`);
      
      // Generate pageConfig.json in the target page folder
      const outputPath = `/apps/wf-${appName}/src/pages/${pageName}/pageConfig.json`;
      const pageConfig = await genPageConfig(eventTypes, outputPath);
      
      console.log('✅ Successfully generated pageConfig.json');
      alert(`✅ Generated pageConfig for ${appName}/${pageName}\n\nComponents: ${pageConfig.components?.length}\nEventTypes: ${pageConfig.eventTypeCount}`);
      
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
 * Component Choices Panel
 */
const ComponentChoicesPanel = ({ component }) => {
  return (
    <div style={{ padding: "12px" }}>
      <h4>{component.props?.title || "Component Choices"}</h4>
      <p>Component palette goes here</p>
    </div>
  );
};

/**
 * Generic Column Renderer
 */
const GenericColumn = ({ component }) => {
  return (
    <div style={{ padding: "16px" }}>
      <h3>{component.title || component.id}</h3>
      <p>Generic column content</p>
    </div>
  );
};

/**
 * Tabs Renderer
 */
const TabsRenderer = ({ component }) => {
  return (
    <div style={{ padding: "16px" }}>
      <h3>{component.props?.title || "Tabs"}</h3>
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "16px" }}>
        <button style={{ padding: "8px 16px" }}>Component Detail</button>
        <button style={{ padding: "8px 16px" }}>Mermaid Chart</button>
        <button style={{ padding: "8px 16px" }}>Page Renderer</button>
      </div>
      <div>
        <p>Active tab content goes here</p>
      </div>
    </div>
  );
};

export default PageRenderer;