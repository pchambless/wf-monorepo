import React, { useState, useEffect } from 'react';
import PageFlowCanvas from './PageFlowCanvas';
import ComponentPropertiesPanel from './ComponentPropertiesPanel';
import { getVal } from '../utils/api';

const StudioCanvasWrapper = () => {
  const [pageConfig, setPageConfig] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageID, setPageID] = useState(null);

  // Poll for pageID from database context_store
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const result = await getVal('pageID', 'raw');
        if (result?.resolvedValue && result.resolvedValue !== pageID) {
          setPageID(result.resolvedValue);
        }
      } catch (error) {
        console.error('Failed to fetch pageID from context:', error);
      }
    };

    fetchContext();
    const interval = setInterval(fetchContext, 500); // Poll every 500ms
    return () => clearInterval(interval);
  }, [pageID]);

  useEffect(() => {
    const loadPageConfig = async () => {
      if (!pageID) {
        setPageConfig(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/genPageConfig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageID })
        });
        const data = await response.json();
        setPageConfig(data.pageConfig);
      } catch (error) {
        console.error('Failed to load pageConfig:', error);
        setPageConfig(null);
      } finally {
        setLoading(false);
      }
    };

    loadPageConfig();
  }, [pageID]);

  const handleNodeSelect = (component) => {
    setSelectedComponent(component);
  };

  const handleSave = async () => {
    console.log('Saving component:', selectedComponent);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>Loading page structure...</div>
      </div>
    );
  }

  if (!pageConfig) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📄</div>
        <div style={styles.emptyText}>Select a page to edit</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.canvasArea}>
        <PageFlowCanvas
          pageConfig={pageConfig}
          onNodeSelect={handleNodeSelect}
        />
      </div>
      <div style={styles.propertiesArea}>
        <ComponentPropertiesPanel
          selectedComponent={selectedComponent}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    height: '100%',
    width: '100%',
    gap: '0',
  },
  canvasArea: {
    flex: '1 1 60%',
    minWidth: 0,
  },
  propertiesArea: {
    flex: '0 0 350px',
    minWidth: '350px',
    maxWidth: '350px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'left',
    height: '100%',
    fontSize: '16px',
    color: '#64748b',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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

export default StudioCanvasWrapper;
