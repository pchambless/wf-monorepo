import React, { useState, useEffect } from 'react';
import { syncToMySQL, hasPendingChanges } from '../db/operations';
import { clearPageData } from '../utils/pageLoader';
import { getPendingSyncs } from '../db/studioDb';
import PagePreviewPanel from './PagePreviewPanel';

const styles = {
  container: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '48px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500
  },
  badgeClean: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  button: {
    padding: '6px 14px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s'
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: '1px solid #2563eb'
  },
  discardButton: {
    color: '#dc2626',
    border: '1px solid #fca5a5'
  },
  previewButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: '1px solid #059669'
  },
  message: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: 'auto'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '95vw',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  modalClose: {
    padding: '8px 12px',
    fontSize: '18px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '4px',
  },
  modalBody: {
    flex: 1,
    overflow: 'hidden',
  },
};

const PageDraftControls = ({ pageID }) => {
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaveMessage, setLastSaveMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (!pageID) {
      setIsModified(false);
      return;
    }

    checkModified();
    const interval = setInterval(checkModified, 1000);
    return () => clearInterval(interval);
  }, [pageID]);

  const checkModified = async () => {
    if (!pageID) return;
    const modified = await hasPendingChanges();
    setIsModified(modified);
  };

  const handleSave = async () => {
    if (!pageID || saving) return;

    setSaving(true);
    setLastSaveMessage('');

    try {
      const results = await syncToMySQL();
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`Save completed: ${successCount} succeeded, ${failCount} failed`);
      } else {
        setLastSaveMessage(`✅ ${successCount} operations saved`);
        setTimeout(() => setLastSaveMessage(''), 3000);
      }

      await checkModified();
    } catch (error) {
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!pageID) return;

    const confirmed = window.confirm(
      'Discard all unsaved changes? This will reload from MySQL.'
    );

    if (!confirmed) return;

    try {
      await clearPageData(pageID);
      setLastSaveMessage('🗑️ Changes discarded');
      setTimeout(() => setLastSaveMessage(''), 3000);
      await checkModified();
      window.location.reload();
    } catch (error) {
      alert(`Failed to discard: ${error.message}`);
    }
  };

  if (!pageID) {
    return null;
  }

  const getBadgeStyle = () => {
    return isModified ? styles.badge : { ...styles.badge, ...styles.badgeClean };
  };

  return (
    <>
      <div style={styles.container}>
        <span style={getBadgeStyle()}>
          {isModified ? '● Unsaved changes' : '✓ All changes saved'}
        </span>

        {isModified && (
          <>
            <button
              style={{ ...styles.button, ...styles.saveButton }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save to MySQL'}
            </button>

            <button
              style={{ ...styles.button, ...styles.discardButton }}
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard Changes
            </button>
          </>
        )}

        <button
          style={{ ...styles.button, ...styles.previewButton }}
          onClick={() => setShowPreviewModal(true)}
          disabled={!pageID}
        >
          👁️ Page Preview
        </button>

        {lastSaveMessage && (
          <span style={styles.message}>{lastSaveMessage}</span>
        )}
      </div>

      {showPreviewModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPreviewModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Page Preview</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <PagePreviewPanel pageID={pageID} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageDraftControls;
