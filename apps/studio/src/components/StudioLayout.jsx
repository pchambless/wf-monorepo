import React, { useState } from 'react';
import StudioSidebar from './StudioSidebar';
import PageFlowCanvas from './PageFlowCanvas';
import ComponentPropertiesPanel from './ComponentPropertiesPanel';

const StudioLayout = () => {
  const [pageConfig, setPageConfig] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const handlePageConfigLoaded = (config) => {
    setPageConfig(config);
    setSelectedComponent(null);
  };

  const handleNodeSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleSaveComponent = async () => {
    console.log('Saving component:', selectedComponent);
    // TODO: Wire up database UPDATE
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <StudioSidebar onPageConfigLoaded={handlePageConfigLoaded} />
      </div>

      <div style={styles.canvas}>
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
    width: '360px',
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
