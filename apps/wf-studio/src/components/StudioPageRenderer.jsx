import React from "react";
import ComponentDetailCard from "./ComponentDetailCard.jsx";

/**
 * Studio Page Renderer
 * Renders Studio pages from pageConfig.json (generated from eventTypes)
 */
const StudioPageRenderer = ({ pageConfig }) => {
  if (!pageConfig) {
    return <div>Loading Studio interface...</div>;
  }

  // Extract layout type
  const isThreeColumn = pageConfig.layout === "three-column";

  if (isThreeColumn) {
    return <ThreeColumnLayout pageConfig={pageConfig} />;
  }

  // Fallback to basic layout
  return <BasicLayout pageConfig={pageConfig} />;
};

/**
 * Three Column Layout Renderer
 */
const ThreeColumnLayout = ({ pageConfig }) => {
  const leftComponent = pageConfig.components?.find(c => c.position === "left");
  const middleComponent = pageConfig.components?.find(c => c.position === "middle");  
  const rightComponent = pageConfig.components?.find(c => c.position === "right");

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif"
    },
    leftColumn: {
      width: leftComponent?.width || "280px",
      backgroundColor: leftComponent?.props?.style?.backgroundColor || "#f5f5f5",
      borderRight: "1px solid #e0e0e0",
      overflow: "auto"
    },
    middleColumn: {
      width: middleComponent?.width || "200px", 
      backgroundColor: middleComponent?.props?.style?.backgroundColor || "#fafafa",
      borderRight: "1px solid #e0e0e0",
      overflow: "auto"
    },
    rightColumn: {
      flex: rightComponent?.flex || 1,
      backgroundColor: rightComponent?.props?.style?.backgroundColor || "#ffffff",
      overflow: "auto"
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Column */}
      <div style={styles.leftColumn}>
        {leftComponent && (
          <ComponentRenderer component={leftComponent} />
        )}
      </div>

      {/* Middle Column */}
      <div style={styles.middleColumn}>
        {middleComponent && (
          <ComponentRenderer component={middleComponent} />
        )}
      </div>

      {/* Right Column */}
      <div style={styles.rightColumn}>
        {rightComponent && (
          <ComponentRenderer component={rightComponent} />
        )}
      </div>
    </div>
  );
};

/**
 * Basic Layout Renderer (fallback)
 */
const BasicLayout = ({ pageConfig }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>{pageConfig.title}</h1>
      <p>{pageConfig.purpose}</p>
      {pageConfig.components?.map((component, index) => (
        <ComponentRenderer key={component.id || index} component={component} />
      ))}
    </div>
  );
};

/**
 * Component Renderer
 * Renders individual components based on type
 */
const ComponentRenderer = ({ component }) => {
  const { type, props = {}, components = [] } = component;

  switch (type) {
    case "sidebar":
      return <SidebarRenderer component={component} />;
    case "compactPanel":
      return <CompactPanelRenderer component={component} />;
    case "tabs":
      return <TabsRenderer component={component} />;
    default:
      return (
        <div style={{ 
          padding: "16px", 
          border: "1px dashed #ccc", 
          margin: "8px",
          borderRadius: "4px"
        }}>
          <h4>{component.id || component.type}</h4>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Component type: {type}
          </p>
          {components.length > 0 && (
            <div style={{ marginTop: "12px" }}>
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
 * Sidebar Component Renderer
 */
const SidebarRenderer = ({ component }) => {
  const [selectedApp, setSelectedApp] = React.useState('plans');
  const [selectedPage, setSelectedPage] = React.useState('PlanManager');
  
  const availableApps = ['plans', 'client', 'admin'];
  const availablePages = {
    plans: ['PlanManager', 'Dashboard', 'SketchPad'],
    client: [],
    admin: []
  };

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
    // Update contextStore
    import('../stores/contextStore').then(({ setVal }) => {
      setVal('selectedApp', appName);
      setVal('selectedPage', availablePages[appName]?.[0] || null);
      setVal('selectedEventType', null);
    });
  };

  const handlePageChange = (pageName) => {
    setSelectedPage(pageName);
    // Update contextStore
    import('../stores/contextStore').then(({ setVal }) => {
      setVal('selectedPage', pageName);
      setVal('selectedEventType', null);
    });
  };

  const handleEventTypeClick = (eventTypeName) => {
    // Update contextStore
    import('../stores/contextStore').then(({ setVal }) => {
      setVal('selectedEventType', eventTypeName);
    });
    console.log('Selected eventType:', eventTypeName);
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
          >
            {availableApps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
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
        <div style={{ marginTop: "4px" }}>
          <select 
            style={{ width: "100%", padding: "4px" }}
            value={selectedPage || ''}
            onChange={(e) => handlePageChange(e.target.value)}
          >
            <option value="">Select page...</option>
            {availablePages[selectedApp]?.map(page => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
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
 * Compact Panel Renderer - Now uses 2-column layout and shared config
 */
const CompactPanelRenderer = ({ component }) => {
  const [categories, setCategories] = React.useState({ containers: [], widgets: [] });

  React.useEffect(() => {
    // Load categories from shared configuration
    import('../config/componentCategories').then(({ getCategoriesGrouped }) => {
      setCategories(getCategoriesGrouped());
    });
  }, []);

  const handleComponentClick = (componentType, category) => {
    // Update contextStore to mark as dirty and log the action
    import('../stores/contextStore').then(({ getVal, setVal }) => {
      const selectedEventType = getVal('selectedEventType');
      if (selectedEventType) {
        setVal('isDirty', true);
        console.log(`✨ Adding ${componentType.label} (${category}) to ${selectedEventType}`);
        
        // Future enhancement: Auto-populate Category dropdown
        // setVal('selectedCategory', componentType.id);
      } else {
        console.log('⚠️ No eventType selected - please select an eventType first');
      }
    });
  };

  const buttonStyle = {
    padding: "4px 8px",
    fontSize: "11px", 
    border: "1px solid #ddd",
    borderRadius: "3px",
    backgroundColor: "#fff",
    cursor: "pointer",
    textAlign: "left",
    transition: "background-color 0.2s"
  };

  return (
    <div style={{ padding: "12px" }}>
      <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
        {component.props?.title || "Component Choices"}
      </h4>
      
      {/* Containers - 2 Column Grid */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px", color: "#374151" }}>
          Containers
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "4px" 
        }}>
          {categories.containers.map(item => (
            <button 
              key={item.id}
              style={buttonStyle}
              onClick={() => handleComponentClick(item, 'container')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              title={item.description}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets - 2 Column Grid */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px", color: "#374151" }}>
          Widgets  
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "4px" 
        }}>
          {categories.widgets.map(item => (
            <button 
              key={item.id}
              style={buttonStyle}
              onClick={() => handleComponentClick(item, 'widget')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              title={item.description}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions - 2 Column Grid */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px", color: "#374151" }}>
          Quick Actions
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "4px" 
        }}>
          <button 
            style={{...buttonStyle, backgroundColor: "#e3f2fd"}}
            onClick={() => {
              import('../stores/contextStore').then(({ getAllVals }) => {
                console.log('🔍 Studio State:', getAllVals());
              });
            }}
            title="Show current contextStore state"
          >
            Show State
          </button>
          <button 
            style={{...buttonStyle, backgroundColor: "#f3e5f5"}}
            onClick={() => {
              import('../stores/contextStore').then(({ setVal }) => {
                setVal('isDirty', false);
                console.log('💾 Marked as saved');
              });
            }}
            title="Mark current changes as saved"
          >
            Mark Saved
          </button>
        </div>
      </div>
    </div>
  );
};

// ComponentDetailCard now imported from separate module

/**
 * Tabs Renderer
 */
const TabsRenderer = ({ component }) => {
  return (
    <div style={{ padding: "16px", height: "100%" }}>
      <div style={{ 
        borderBottom: "1px solid #ddd",
        marginBottom: "16px",
        display: "flex",
        gap: "8px"
      }}>
        {["Component Detail", "Mermaid Chart", "Page Renderer"].map((tab, index) => (
          <button 
            key={tab}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              borderBottom: index === 0 ? "1px solid #fff" : "1px solid #ddd",
              borderRadius: "4px 4px 0 0",
              backgroundColor: index === 0 ? "#fff" : "#f5f5f5",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ 
        backgroundColor: "#fff",
        border: "1px solid #ddd", 
        borderRadius: "4px",
        padding: "16px",
        height: "calc(100% - 80px)"
      }}>
        <ComponentDetailCard />
      </div>
    </div>
  );
};

export default StudioPageRenderer;