import React, { useState } from 'react';
import StudioSidebar from './StudioSidebar';
import PageFlowCanvas from './PageFlowCanvas';
import ComponentPropertiesPanel from './ComponentPropertiesPanel';
import PageDraftControls from './PageDraftControls';

const StudioLayout = () => {
  const [pageConfig, setPageConfig] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [currentPageID, setCurrentPageID] = useState(null);

  const handlePageConfigLoaded = (config, pageID) => {
    setPageConfig(config);
    setSelectedComponent(null);
    setCurrentPageID(pageID);
  };

  const handleNodeSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleSaveComponent = async (updatedData) => {
    try {
      console.log('Saving component:', updatedData);

      // Update title in eventType_xref
      if (updatedData.title !== selectedComponent.label) {
        await fetch('http://localhost:3001/api/execDML', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventType_xref',
            data: { title: updatedData.title },
            where: { xref_id: updatedData.xref_id }
          })
        });
      }

      // Update container if changed
      if (updatedData.container !== selectedComponent.container) {
        await fetch('http://localhost:3001/api/execDML', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventType_xref',
            data: { container: updatedData.container },
            where: { xref_id: updatedData.xref_id }
          })
        });
      }

      // Update props by updating/inserting into eventProps table
      const propsEntries = Object.entries(updatedData.eventProps);
      for (const [paramName, paramVal] of propsEntries) {
        await fetch('http://localhost:3001/api/execDML', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPSERT',
            table: 'api_wf.eventProps',
            data: {
              xref_id: updatedData.xref_id,
              paramName,
              paramVal: typeof paramVal === 'object' ? JSON.stringify(paramVal) : String(paramVal),
              active: 1
            }
          })
        });
      }

      console.log('✅ Component saved successfully');
      alert('Component saved successfully!');

    } catch (error) {
      console.error('❌ Failed to save component:', error);
      alert('Failed to save component: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <StudioSidebar onPageConfigLoaded={handlePageConfigLoaded} />
      </div>

      <div style={styles.canvas}>
        <PageDraftControls pageID={currentPageID} />
        {pageConfig ? (
          <PageFlowCanvas
            pageConfig={pageConfig}
            onNodeSelect={handleNodeSelect}
          />
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎨</div>
            <div style={styles.emptyText}>Select a page to begin editing</div>
          </div>
        )}
      </div>

      <div style={styles.properties}>
        <ComponentPropertiesPanel
          selectedComponent={selectedComponent}
          pageID={currentPageID}
          onSave={handleSaveComponent}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  canvas: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  properties: {
    width: '480px',
    flexShrink: 0,
    borderLeft: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: 500,
  },
};

export default StudioLayout;
