import React, { useState, useEffect, useRef } from 'react';
import { buildPageConfig } from '../utils/pageConfigBuilder';
import { formatPageConfig } from '../utils/pageConfigBuilder/formatPageConfig';
import DirectRenderer from '../rendering/DirectRenderer';
import mermaid from 'mermaid';

const PagePreviewPanel = ({ pageID }) => {
  const [activeTab, setActiveTab] = useState('code');
  const [pageConfig, setPageConfig] = useState(null);
  const [mermaidText, setMermaidText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mermaidRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
  }, []);

  useEffect(() => {
    if (pageID) {
      loadPageConfig();
    }
  }, [pageID]);

  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidText && mermaidRef.current && activeTab === 'mermaid') {
        try {
          mermaidRef.current.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-diagram', mermaidText);
          mermaidRef.current.innerHTML = svg;
        } catch (err) {
          console.error('Mermaid render error:', err);
          mermaidRef.current.innerHTML = `<pre style="color: red;">Mermaid Error: ${err.message}</pre>`;
        }
      }
    };
    renderMermaid();
  }, [mermaidText, activeTab]);

  const loadPageConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await buildPageConfig(pageID);

      if (result.success) {
        setPageConfig(result.pageConfig);
        setMermaidText(result.mermaidText);
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
    if (!pageConfig) return;

    try {
      const response = await fetch('http://localhost:3001/api/genPageConfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageConfig,
          mermaidText,
          appName: pageConfig.routePath?.split('/')[1] || 'whatsfresh',
          pageName: pageConfig.routePath?.split('/')[2] || 'unknown',
          pageID
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ PageConfig synced successfully!\n\nFiles written to:\n${result.meta.productionDir}\n\n- pageConfig.json\n- index.jsx\n- pageMermaid.mmd`);
      } else {
        alert(`❌ Sync failed: ${result.error || result.message}`);
      }
    } catch (error) {
      alert(`❌ Sync failed: ${error.message}`);
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
            📋 PageConfig Code
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
            📊 Mermaid Diagram
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
            📤 Sync to Server
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
            <DirectRenderer config={pageConfig} />
          </div>
        )}

        {!loading && !error && mermaidText && activeTab === 'mermaid' && (
          <div style={styles.mermaidView}>
            <div ref={mermaidRef} style={styles.mermaidContainer}></div>
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
    overflow: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
  },
  mermaidContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
};

export default PagePreviewPanel;
