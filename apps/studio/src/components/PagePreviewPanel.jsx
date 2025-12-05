import React, { useState, useEffect, useRef } from 'react';
import { buildPageConfig } from '../utils/pageConfigBuilder';
import { formatPageConfig } from '../utils/pageConfigBuilder/formatPageConfig';
import PageRenderer from '../rendering/PageRenderer';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const PagePreviewPanel = ({ pageID }) => {
  const [activeTab, setActiveTab] = useState('code');
  const [mermaidSubTab, setMermaidSubTab] = useState('structure');
  const [mermaidOrientation, setMermaidOrientation] = useState('TD'); // TD or LR
  const [pageConfig, setPageConfig] = useState(null);
  const [structureDiagram, setStructureDiagram] = useState(null);
  const [workflowDiagram, setWorkflowDiagram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mermaidRef = useRef(null);
  const transformRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    });
  }, []);

  useEffect(() => {
    if (pageID) {
      loadPageConfig();
    }
  }, [pageID]);

  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidRef.current && activeTab === 'mermaid') {
        const currentDiagram = mermaidSubTab === 'structure' ? structureDiagram : workflowDiagram;
        if (currentDiagram) {
          try {
            mermaidRef.current.innerHTML = '';
            // Replace orientation in diagram (graph TD or graph LR)
            const orientedDiagram = currentDiagram.replace(/graph (TD|LR)/, `graph ${mermaidOrientation}`);
            const { svg } = await mermaid.render('mermaid-diagram', orientedDiagram);
            mermaidRef.current.innerHTML = svg;
          } catch (err) {
            console.error('Mermaid render error:', err);
            mermaidRef.current.innerHTML = `<pre style="color: red;">Mermaid Error: ${err.message}</pre>`;
          }
        }
      }
    };
    renderMermaid();
  }, [structureDiagram, workflowDiagram, activeTab, mermaidSubTab, mermaidOrientation]);

  const loadPageConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await buildPageConfig(pageID);

      if (result.success) {
        setPageConfig(result.pageConfig);
        setStructureDiagram(result.structureDiagram);
        setWorkflowDiagram(result.workflowDiagram);
        console.log('✅ PageConfig built:', result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to build pageConfig:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPageConfig();
  };

  const handleSync = async () => {
    if (!pageConfig || !pageID) return;

    setLoading(true);
    try {
      // Use execDML to update page_registry.pageConfig
      const response = await fetch('http://localhost:3002/api/execDML', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          method: 'UPDATE',
          table: 'api_wf.page_registry',
          data: {
            id: pageID,
            pageConfig: JSON.stringify(pageConfig, null, 2)
          },
          primaryKey: 'id'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ PageConfig saved to database!\n\nTable: page_registry\nPage ID: ${pageID}\nColumn: pageConfig`);
      } else {
        alert(`❌ Save failed: ${result.error || result.message}`);
      }
    } catch (error) {
      alert(`❌ Save failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!pageID) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📄</div>
        <div style={styles.emptyText}>Select a page to preview</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          <button
            style={activeTab === 'code' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('code')}
          >
            📋 pageConfig
          </button>
          <button
            style={activeTab === 'rendered' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('rendered')}
          >
            🎨 Rendered Page
          </button>
          <button
            style={activeTab === 'mermaid' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('mermaid')}
          >
            📊 Mermaid Diagrams
          </button>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.refreshButton}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '⟳ Loading...' : '🔄 Refresh'}
          </button>
          <button
            style={styles.syncButton}
            onClick={handleSync}
            disabled={!pageConfig || loading}
          >
            💾 Save PageConfig to DB
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}>⟳</div>
            <div>Building pageConfig...</div>
          </div>
        )}

        {error && (
          <div style={styles.errorState}>
            <div style={styles.errorIcon}>⚠️</div>
            <div style={styles.errorTitle}>Failed to build pageConfig</div>
            <div style={styles.errorMessage}>{error}</div>
            <button style={styles.retryButton} onClick={loadPageConfig}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && pageConfig && activeTab === 'code' && (
          <div style={styles.codeView}>
            <pre style={styles.codeBlock}>
              {formatPageConfig(pageConfig)}
            </pre>
          </div>
        )}

        {!loading && !error && pageConfig && activeTab === 'rendered' && (
          <div style={styles.renderedView}>
            <PageRenderer config={pageConfig} eventTypeConfig={window.eventTypeConfig || {}} />
          </div>
        )}

        {!loading && !error && (structureDiagram || workflowDiagram) && activeTab === 'mermaid' && (
          <div style={styles.mermaidView}>
            <div style={styles.mermaidSubTabs}>
              <button
                style={mermaidSubTab === 'structure' ? styles.subTabActive : styles.subTab}
                onClick={() => setMermaidSubTab('structure')}
              >
                🏗️ Structure
              </button>
              <button
                style={mermaidSubTab === 'workflow' ? styles.subTabActive : styles.subTab}
                onClick={() => setMermaidSubTab('workflow')}
              >
                🔄 Workflow
              </button>
            </div>
            <TransformWrapper
              ref={transformRef}
              initialScale={0.8}
              minScale={0.3}
              maxScale={8}
              centerOnInit={true}
              wheel={{ step: 0.15 }}
              doubleClick={{ disabled: false, step: 0.7 }}
            >
              {({ zoomIn, zoomOut, resetTransform, centerView }) => {
                React.useEffect(() => {
                  resetTransform();
                }, [mermaidSubTab, resetTransform]);

                return (
                <>
                  <div style={styles.mermaidControls}>
                    <button style={styles.controlButton} onClick={() => zoomIn()}>
                      🔍+ Zoom In
                    </button>
                    <button style={styles.controlButton} onClick={() => zoomOut()}>
                      🔍- Zoom Out
                    </button>
                    <button style={styles.controlButton} onClick={() => resetTransform()}>
                      ↺ Reset View
                    </button>
                    <button
                      style={styles.controlButton}
                      onClick={() => {
                        setMermaidOrientation(prev => prev === 'TD' ? 'LR' : 'TD');
                        resetTransform();
                      }}
                    >
                      🔄 {mermaidOrientation === 'TD' ? 'Top→Down' : 'Left→Right'}
                    </button>
                    <button
                      style={styles.controlButton}
                      onClick={() => {
                        const currentDiagram = mermaidSubTab === 'structure' ? structureDiagram : workflowDiagram;
                        navigator.clipboard.writeText(currentDiagram);
                        alert('Mermaid code copied to clipboard!');
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>
                  <TransformComponent
                    wrapperStyle={styles.mermaidWrapper}
                    contentStyle={styles.mermaidContent}
                  >
                    <div ref={mermaidRef} style={styles.mermaidContainer}></div>
                  </TransformComponent>
                </>
                );
              }}
            </TransformWrapper>
            <details style={styles.mermaidCodeSection}>
              <summary style={styles.mermaidCodeSummary}>View Mermaid Code</summary>
              <pre style={styles.mermaidCodeBlock}>
                {mermaidSubTab === 'structure' ? structureDiagram : workflowDiagram}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.15s',
  },
  tabActive: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: '#fff',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  refreshButton: {
    padding: '8px 14px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  syncButton: {
    padding: '8px 14px',
    fontSize: '13px',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
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
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: 500,
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '14px',
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '12px',
    animation: 'spin 1s linear infinite',
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '32px',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#dc2626',
    marginBottom: '8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
  codeView: {
    height: '100%',
    overflow: 'auto',
  },
  codeBlock: {
    margin: 0,
    padding: '20px',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    minHeight: '100%',
  },
  renderedView: {
    height: '100%',
    overflow: 'auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
  },
  mermaidView: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fff',
  },
  mermaidSubTabs: {
    display: 'flex',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0',
  },
  subTab: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.15s',
  },
  subTabActive: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: '#f1f5f9',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: '6px 6px 0 0',
    borderBottom: '2px solid #3b82f6',
    marginBottom: '-2px',
  },
  mermaidControls: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  controlButton: {
    padding: '6px 12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s',
  },
  mermaidWrapper: {
    flex: 1,
    width: '100%',
    height: '600px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  mermaidContent: {
    display: 'inline-block',
  },
  mermaidContainer: {
    padding: '40px',
    display: 'inline-block',
    minWidth: '100%',
    minHeight: '100%',
  },
  mermaidCodeSection: {
    marginTop: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
  },
  mermaidCodeSummary: {
    padding: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    color: '#475569',
  },
  mermaidCodeBlock: {
    margin: 0,
    padding: '16px',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
    borderRadius: '0 0 6px 6px',
  },
};

export default PagePreviewPanel;
