import React, { useState, useEffect } from 'react';

const ComponentPropertiesDirect = ({ selectedComponent, pageID, eventTypes, triggers }) => {
  const [componentProps, setComponentProps] = useState([]);
  const [componentTriggers, setComponentTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('component');

  useEffect(() => {
    if (selectedComponent?.id && pageID) {
      loadComponentData();
    }
  }, [selectedComponent?.id, pageID]);

  const loadComponentData = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading component data for:', selectedComponent.id);

      // Load props for this component
      const propsResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageProps',
          params: { pageID }
        })
      });
      const propsResult = await propsResponse.json();
      const props = (propsResult.data || []).filter(p => p.xref_id === selectedComponent.id);
      setComponentProps(props);
      console.log('✅ Loaded props:', props.length);

      // Load triggers for this component
      const triggersResponse = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: 'pageTriggers',
          params: { pageID }
        })
      });
      const triggersResult = await triggersResponse.json();
      const compTriggers = (triggersResult.data || []).filter(t => t.xref_id === selectedComponent.id);
      setComponentTriggers(compTriggers);
      console.log('✅ Loaded triggers:', compTriggers.length);
    } catch (error) {
      console.error('❌ Error loading component data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedComponent) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎯</div>
          <div style={styles.emptyText}>Select a component to edit</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{selectedComponent.comp_name}</h3>
        <span style={styles.subtitle}>({selectedComponent.comp_type})</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'component' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('component')}
        >
          Component
        </button>
        <button
          style={activeTab === 'props' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('props')}
        >
          Props ({componentProps.length})
        </button>
        <button
          style={activeTab === 'triggers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('triggers')}
        >
          Triggers ({componentTriggers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {loading && <div style={styles.loading}>Loading...</div>}

        {!loading && activeTab === 'component' && (
          <div style={styles.section}>
            <div style={styles.field}>
              <label style={styles.label}>ID</label>
              <input style={styles.input} value={selectedComponent.id} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={selectedComponent.comp_name} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <input style={styles.input} value={selectedComponent.comp_type} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Parent ID</label>
              <input style={styles.input} value={selectedComponent.parent_id} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Position Order</label>
              <input style={styles.input} value={selectedComponent.posOrder} readOnly />
            </div>
          </div>
        )}

        {!loading && activeTab === 'props' && (
          <div style={styles.section}>
            {componentProps.length === 0 ? (
              <div style={styles.emptySection}>No props defined</div>
            ) : (
              componentProps.map((prop, idx) => (
                <div key={idx} style={styles.propItem}>
                  <div style={styles.propName}>{prop.paramName}</div>
                  <div style={styles.propValue}>{String(prop.paramVal).substring(0, 100)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'triggers' && (
          <div style={styles.section}>
            {componentTriggers.length === 0 ? (
              <div style={styles.emptySection}>No triggers defined</div>
            ) : (
              componentTriggers.map((trigger, idx) => (
                <div key={idx} style={styles.triggerItem}>
                  <div style={styles.triggerHeader}>
                    <span style={styles.triggerClass}>{trigger.class}</span>
                    <span style={styles.triggerAction}>{trigger.action}</span>
                  </div>
                  <div style={styles.triggerContent}>{String(trigger.content).substring(0, 100)}</div>
                </div>
              ))
            )}
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
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginLeft: '8px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
  },
  tab: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1976d2',
    fontWeight: '600',
    borderBottom: '2px solid #1976d2',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#f9f9f9',
  },
  propItem: {
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  propName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
  },
  propValue: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  triggerItem: {
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
  },
  triggerHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  triggerClass: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  triggerAction: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#388e3c',
    backgroundColor: '#e8f5e9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  triggerContent: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '16px',
  },
  emptySection: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
};

export default ComponentPropertiesDirect;
