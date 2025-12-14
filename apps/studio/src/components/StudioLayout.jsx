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
  const [propertiesWidth, setPropertiesWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [componentTreeData, setComponentTreeData] = useState([]);
  const [triggerData, setTriggerData] = useState([]);
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

  const handlePageConfigLoaded = async (config, pageID) => {
    setSelectedComponent(null);
    setCurrentPageID(pageID);
    
    // Load component tree data for this page
    await loadComponentTree(pageID);
  };

  const loadComponentTree = async (pageID) => {
    try {
      console.log('🌳 StudioLayout: Loading component tree and triggers for pageID:', pageID);

      // Fetch components and triggers in parallel
      const [compResponse, triggerResponse] = await Promise.all([
        fetch('http://localhost:3002/api/execEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            eventSQLId: 'fetchPageStructure',
            params: { pageID }
          })
        }),
        fetch('http://localhost:3002/api/execEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            eventSQLId: 'pageTriggers',
            params: { pageID }
          })
        })
      ]);
      
      const compResult = await compResponse.json();
      const triggerResult = await triggerResponse.json();
      
      // Stored procedures return data as [results_array, metadata_object]
      const componentsData = compResult.data?.[0] || [];
      const triggersData = triggerResult.data || [];
      
      console.log('✅ StudioLayout: Component tree loaded:', componentsData.length);
      console.log('✅ StudioLayout: Triggers loaded:', triggersData.length);
      
      setComponentTreeData(componentsData);
      setTriggerData(triggersData);
    } catch (error) {
      console.error('❌ StudioLayout: Error loading component tree:', error);
      setComponentTreeData([]);
      setTriggerData([]);
    }
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

    // Min width 300px, max width 900px (increased for better properties editing with tree view)
    if (newWidth >= 300 && newWidth <= 900) {
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
        
        {/* Action Bar */}
        {currentPageID && (
          <div style={styles.actionBar}>
            <button
              style={styles.diagramButton}
              onClick={() => setShowDiagramModal(true)}
            >
              📊 View Diagrams
            </button>
          </div>
        )}

        {/* Tree View Content */}
        {currentPageID ? (
          <div style={styles.tabContent}>
            <ComponentTreeDirect
              pageID={currentPageID}
              componentTreeData={componentTreeData}
              triggerData={triggerData}
              selectedComponent={selectedComponent}
              onComponentSelect={handleNodeSelect}
              onTreeUpdate={loadComponentTree}
            />
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

      {/* Diagram Modal */}
      {showDiagramModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDiagramModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Page Diagrams</h2>
              <button style={styles.modalClose} onClick={() => setShowDiagramModal(false)}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <DiagramView 
                pageID={currentPageID}
                componentTreeData={componentTreeData}
                triggerData={triggerData}
              />
            </div>
          </div>
        </div>
      )}
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
    width: "400px",
    flexShrink: 0,
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
  actionBar: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  diagramButton: {
    padding: "8px 16px",
    border: "1px solid #1976d2",
    backgroundColor: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1976d2",
    transition: "all 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "90vw",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f5f5f5",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  modalBody: {
    flex: 1,
    overflow: "auto",
    padding: "0",
    display: "flex",
    flexDirection: "column",
  },
};

export default StudioLayout;
