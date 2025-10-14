import React, { useState, useEffect } from 'react';
import { syncToMySQL, getPendingChanges, clearAllDMLFlags } from '../db/operations';

const styles = {
  container: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
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
  badgeZero: {
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
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: '1px solid #2563eb'
  },
  dangerButton: {
    backgroundColor: '#fff',
    color: '#dc2626',
    border: '1px solid #dc2626'
  },
  summary: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: 'auto'
  }
};

const SyncControls = () => {
  const [summary, setSummary] = useState({ total: 0, byTable: {}, byAction: {} });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSummary = async () => {
    const data = await getPendingChanges();
    const summary = {
      total: data.total,
      byTable: {},
      byAction: {}
    };
    setSummary(summary);
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const results = await syncToMySQL();
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`Sync completed: ${successCount} succeeded, ${failCount} failed`);
      } else {
        console.log(`✅ Synced ${successCount} changes`);
      }

      await loadSummary();
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm(`Discard ${summary.total} pending changes?`)) return;

    try {
      await clearAllDMLFlags();
      await loadSummary();
      console.log('✅ Pending changes discarded');
    } catch (error) {
      alert(`Failed to discard: ${error.message}`);
    }
  };

  const getBadgeStyle = () => {
    return summary.total === 0 ? { ...styles.badge, ...styles.badgeZero } : styles.badge;
  };

  return (
    <div style={styles.container}>
      <span style={getBadgeStyle()}>
        {summary.total === 0 ? '✓' : '●'} {summary.total} pending
      </span>

      {summary.total > 0 && (
        <>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync to MySQL'}
          </button>

          <button
            style={{ ...styles.button, ...styles.dangerButton }}
            onClick={handleDiscard}
          >
            Discard Changes
          </button>

          <div style={styles.summary}>
            {Object.entries(summary.byAction).map(([action, count]) => (
              <span key={action} style={{ marginRight: '12px' }}>
                {action}: {count}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SyncControls;
