import React, { useState, useEffect } from 'react';
import { savePageToMySQL, isDraftModified } from '../utils/studioSaveWorkflow';
import { clearPageData } from '../utils/pageLoader';
import { getPendingSyncs } from '../db/studioDb';

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
  message: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: 'auto'
  }
};

const PageDraftControls = ({ pageID }) => {
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaveMessage, setLastSaveMessage] = useState('');

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
    const modified = await isDraftModified(pageID);
    setIsModified(modified);
  };

  const handleSave = async () => {
    if (!pageID || saving) return;

    setSaving(true);
    setLastSaveMessage('');

    try {
      const result = await savePageToMySQL(pageID);

      if (result.success) {
        setLastSaveMessage(`✅ ${result.operations.length} operations saved`);
        setTimeout(() => setLastSaveMessage(''), 3000);
      } else {
        alert(`Save failed: ${result.failed} error(s)\n${result.errors.map(e => e.error).join('\n')}`);
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

      {lastSaveMessage && (
        <span style={styles.message}>{lastSaveMessage}</span>
      )}
    </div>
  );
};

export default PageDraftControls;
