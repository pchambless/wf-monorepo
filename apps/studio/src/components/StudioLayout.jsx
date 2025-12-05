import React, { useState, useRef } from "react";
import StudioSidebar from "./StudioSidebar";
import ComponentTree from "./ComponentTree";
import ComponentTreeDirect from "./ComponentTreeDirect";
import DiagramView from "./DiagramView";
import ComponentPropertiesPanel from "./ComponentPropertiesPanel";
import ComponentPropertiesDirect from "./ComponentPropertiesDirect";
import PageDraftControls from "./PageDraftControls";
import FloatingActionButton from "./FloatingActionButton";
import IssuesModal from "./IssuesModal";

const StudioLayout = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [currentPageID, setCurrentPageID] = useState(null);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);
  const [propertiesWidth, setPropertiesWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' or 'diagram'
  const containerRef = useRef(null);

  // Reference data loaded once at startup
  const [eventTypes, setEventTypes] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [referenceDataLoaded, setReferenceDataLoaded] = useState(false);

  // Load reference data once at startup
  React.useEffect(() => {
    const loadReferenceData = async () => {
      try {
        console.log('📚 Loading reference data...');

        // Load eventTypes
        const eventTypesResponse = await fetch('http://localhost:3002/api/execEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            eventSQLId: 'eventTypeList',
            params: {}
          })
        });
        const eventTypesResult = await eventTypesResponse.json();
        setEventTypes(eventTypesResult.data || []);
        console.log('✅ Loaded eventTypes:', eventTypesResult.data?.length);

        // Load triggers
        const triggersResponse = await fetch('http://localhost:3002/api/execEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            eventSQLId: 'fetchTriggers',
            params: {}
          })
        });
        const triggersResult = await triggersResponse.json();
        setTriggers(triggersResult.data || []);
        console.log('✅ Loaded triggers:', triggersResult.data?.length);

        setReferenceDataLoaded(true);
      } catch (error) {
        console.error('❌ Error loading reference data:', error);
      }
    };

    loadReferenceData();
  }, []);

  const handlePageConfigLoaded = (config, pageID) => {
    setSelectedComponent(null);
    setCurrentPageID(pageID);
  };

  const handleNodeSelect = (component) => {
    console.log('🎯 StudioLayout: Component selected:', component);
    setSelectedComponent(component);
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    // Min width 300px, max width 700px (increased for better properties editing)
    if (newWidth >= 300 && newWidth <= 700) {
      setPropertiesWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleSaveComponent = async (updatedData) => {
    try {
      console.log("Saving component:", updatedData);

      // Update title in eventType_xref
      if (updatedData.title !== selectedComponent.label) {
        await fetch("http://localhost:3002/api/execDML", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            method: "UPDATE",
            table: "api_wf.eventType_xref",
            data: { title: updatedData.title },
            where: { xref_id: updatedData.xref_id },
          }),
        });
      }

      // Update container if changed
      if (updatedData.container !== selectedComponent.container) {
        await fetch("http://localhost:3002/api/execDML", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            method: "UPDATE",
            table: "api_wf.eventType_xref",
            data: { container: updatedData.container },
            where: { xref_id: updatedData.xref_id },
          }),
        });
      }

      // Update props by updating/inserting into eventProps table
      const propsEntries = Object.entries(updatedData.eventProps);
      for (const [paramName, paramVal] of propsEntries) {
        await fetch("http://localhost:3002/api/execDML", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            method: "UPSERT",
            table: "api_wf.eventProps",
            data: {
              xref_id: updatedData.xref_id,
              paramName,
              paramVal:
                typeof paramVal === "object"
                  ? JSON.stringify(paramVal)
                  : String(paramVal),
              active: 1,
            },
          }),
        });
      }

      console.log("✅ Component saved successfully");
      alert("Component saved successfully!");
    } catch (error) {
      console.error("❌ Failed to save component:", error);
      alert("Failed to save component: " + error.message);
    }
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={styles.sidebar}>
        <StudioSidebar onPageConfigLoaded={handlePageConfigLoaded} />
      </div>

      <div style={styles.canvas}>
        <PageDraftControls pageID={currentPageID} />
        
        {/* Tab Navigation */}
        {currentPageID && (
          <div style={styles.tabBar}>
            <button
              style={activeTab === 'tree' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('tree')}
            >
              🌲 Tree View
            </button>
            <button
              style={activeTab === 'diagram' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('diagram')}
            >
              📊 Diagram
            </button>
          </div>
        )}

        {/* Tab Content */}
        {currentPageID ? (
          <div style={styles.tabContent}>
            {activeTab === 'tree' && (
              <ComponentTreeDirect
                pageID={currentPageID}
                selectedComponent={selectedComponent}
                onComponentSelect={handleNodeSelect}
              />
            )}
            {activeTab === 'diagram' && (
              <DiagramView pageID={currentPageID} />
            )}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎨</div>
            <div style={styles.emptyText}>Select a page to begin editing</div>
          </div>
        )}
      </div>

      {/* Resizable divider */}
      <div
        style={{
          ...styles.resizer,
          cursor: isResizing ? "ew-resize" : "ew-resize",
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={styles.resizerHandle} />
      </div>

      <div style={{ ...styles.properties, width: `${propertiesWidth}px` }}>
        <ComponentPropertiesDirect
          selectedComponent={selectedComponent}
          pageID={currentPageID}
          eventTypes={eventTypes}
          triggers={triggers}
        />
      </div>

      <FloatingActionButton onClick={() => setIsIssuesModalOpen(true)} />
      <IssuesModal
        isOpen={isIssuesModalOpen}
        onClose={() => setIsIssuesModalOpen(false)}
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    borderRight: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  canvas: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#ffffff",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  resizer: {
    width: "8px",
    flexShrink: 0,
    backgroundColor: "#f1f5f9",
    cursor: "ew-resize",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#e2e8f0",
    },
  },
  resizerHandle: {
    width: "2px",
    height: "40px",
    backgroundColor: "#cbd5e1",
    borderRadius: "1px",
  },
  properties: {
    flexShrink: 0,
    borderLeft: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    overflowY: "auto",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#94a3b8",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: 500,
  },
  tabBar: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  tab: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  tabActive: {
    padding: "8px 16px",
    border: "1px solid #1976d2",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1976d2",
  },
  tabContent: {
    flex: 1,
    overflow: "hidden",
  },
};

export default StudioLayout;
