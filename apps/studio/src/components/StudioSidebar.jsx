import React, { useState, useEffect } from 'react';
import { execEvent, setVals } from '@whatsfresh/shared-imports';

const StudioSidebar = ({ onPageConfigLoaded }) => {
  const [apps, setApps] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const result = await execEvent('appList', {});
      setApps(result.data || []);
    } catch (error) {
      console.error('Failed to load apps:', error);
    }
  };

  const loadPages = async (appID) => {
    try {
      const result = await execEvent('pageList', { appID });
      setPages(result.data || []);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleAppChange = async (e) => {
    const appID = e.target.value;
    const appName = e.target.options[e.target.selectedIndex]?.text;

    setSelectedApp(appID);
    setSelectedPage('');
    setPages([]);
    onPageConfigLoaded(null);

    if (appID) {
      await setVals([
        { paramName: 'appID', paramVal: appID },
        { paramName: 'appName', paramVal: appName }
      ]);
      await loadPages(appID);
    }
  };

  const handlePageChange = async (e) => {
    const pageID = e.target.value;
    const pageName = e.target.options[e.target.selectedIndex]?.text;

    setSelectedPage(pageID);

    if (pageID) {
      await setVals([
        { paramName: 'pageID', paramVal: pageID },
        { paramName: 'pageName', paramVal: pageName }
      ]);
      await loadPageConfig(pageID);
    } else {
      onPageConfigLoaded(null);
    }
  };

  const loadPageConfig = async (pageID) => {
    setLoading(true);
    try {
      console.log('📄 Fetching pageConfig for pageID:', pageID);
      const response = await fetch('http://localhost:3001/api/genPageConfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageID })
      });
      const data = await response.json();
      console.log('📦 PageConfig received:', data.pageConfig);
      onPageConfigLoaded(data.pageConfig);
    } catch (error) {
      console.error('❌ Failed to load pageConfig:', error);
      onPageConfigLoaded(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Studio</h2>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>App</label>
        <select
          value={selectedApp}
          onChange={handleAppChange}
          style={styles.select}
        >
          <option value="">Select an app...</option>
          {apps.map(app => (
            <option key={app.xref_id} value={app.xref_id}>
              {app.comp_name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Page</label>
        <select
          value={selectedPage}
          onChange={handlePageChange}
          style={styles.select}
          disabled={!selectedApp}
        >
          <option value="">Select a page...</option>
          {pages.map(page => (
            <option key={page.xref_id} value={page.xref_id}>
              {page.comp_name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={styles.loadingIndicator}>
          Loading page structure...
        </div>
      )}

      <div style={styles.divider} />

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Component Palette</h3>
        <div style={styles.comingSoon}>Coming soon...</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
  },
  section: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  loadingIndicator: {
    padding: '12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '8px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '24px 0',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
  },
  comingSoon: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
  },
};

export default StudioSidebar;
