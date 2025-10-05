import React, { useState } from 'react';

const ComponentPropertiesPanel = ({ selectedComponent, onSave }) => {
  const [activeTab, setActiveTab] = useState('component');

  if (!selectedComponent) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🎯</div>
        <div style={styles.emptyText}>Select a component to edit</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>{selectedComponent.label}</h3>
        <span style={styles.badge}>{selectedComponent.comp_type}</span>
      </div>

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
          Props
        </button>
        <button
          style={activeTab === 'triggers' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('triggers')}
        >
          Triggers
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'component' && (
          <div style={styles.tabContent}>
            <div style={styles.field}>
              <label style={styles.label}>ID</label>
              <input
                type="text"
                value={selectedComponent.xref_id}
                disabled
                style={styles.inputDisabled}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={selectedComponent.label}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <input
                type="text"
                value={selectedComponent.comp_type}
                disabled
                style={styles.inputDisabled}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Container</label>
              <input
                type="text"
                value={selectedComponent.container || 'None'}
                style={styles.input}
              />
            </div>
          </div>
        )}

        {activeTab === 'props' && (
          <div style={styles.tabContent}>
            <div style={styles.field}>
              <label style={styles.label}>Event Properties</label>
              <textarea
                value={JSON.stringify(selectedComponent.eventProps || {}, null, 2)}
                style={styles.textarea}
                rows={15}
              />
            </div>
          </div>
        )}

        {activeTab === 'triggers' && (
          <div style={styles.tabContent}>
            <div style={styles.comingSoon}>
              <div style={styles.comingSoonIcon}>⚡</div>
              <div style={styles.comingSoonText}>Trigger editor coming soon</div>
              <div style={styles.comingSoonSubtext}>
                Workflows: onLoad, onClick, onRefresh, etc.
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <button style={styles.saveButton} onClick={onSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
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
  header: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid #3b82f6',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  tabContent: {
    padding: '20px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1e293b',
  },
  inputDisabled: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#1e293b',
    resize: 'vertical',
  },
  comingSoon: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  comingSoonText: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '8px',
  },
  comingSoonSubtext: {
    fontSize: '13px',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
  },
  saveButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ComponentPropertiesPanel;
