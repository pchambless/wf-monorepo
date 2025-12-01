import React from 'react';
import PageRenderer from '../rendering/PageRenderer';

const PreviewModal = ({ config, onClose }) => {
  console.log('🎭 PreviewModal config:', config);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{config.title || 'Page Preview'}</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.content}>
          <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px'}}>
            <strong>Preview Status:</strong> Showing {config.components?.length || 0} components from IndexedDB
          </div>
          <PageRenderer config={config} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '1200px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
};

export default PreviewModal;
