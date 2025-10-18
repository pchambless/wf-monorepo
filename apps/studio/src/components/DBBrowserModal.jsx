import React, { useState, useEffect } from 'react';
import { db, clearAllData, exportAllData, getPendingSyncs } from '../db/studioDb';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90vw',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  header: {
    padding: '20px',
    borderBottom: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    fontFamily: 'monospace'
  },
  closeButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    fontFamily: 'monospace'
  },
  stats: {
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase'
  },
  value: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '200px'
  },
  button: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer'
  },
  dangerButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #c00',
    borderRadius: '4px',
    backgroundColor: '#fee',
    color: '#c00',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginTop: '20px'
  },
  th: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '8px',
    textAlign: 'left',
    position: 'sticky',
    top: 0
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  json: {
    fontSize: '11px',
    color: '#666',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

const DBBrowserModal = ({ onClose }) => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedRecord, setExpandedRecord] = useState(null);

  useEffect(() => {
    const storeNames = db.tables.map(t => t.name);
    setStores(storeNames);
    loadStats();
    loadPendingCount();
  }, []);

  const loadStats = async () => {
    const counts = {};
    for (const table of db.tables) {
      counts[table.name] = await table.count();
    }
    setStats(counts);
  };

  const loadPendingCount = async () => {
    const pending = await getPendingSyncs();
    setPendingCount(pending.length);
  };

  const loadStore = async (storeName) => {
    if (!storeName) return;
    setSelectedStore(storeName);
    setExpandedRecord(null);
    const data = await db.table(storeName).toArray();
    setRecords(data);
  };

  const deleteRecord = async (storeName, id) => {
    if (!window.confirm('Delete this record?')) return;
    await db.table(storeName).delete(id);
    loadStore(storeName);
    loadStats();
    loadPendingCount();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear ALL IndexedDB data? This cannot be undone.')) return;
    await clearAllData();
    setRecords([]);
    loadStats();
    loadPendingCount();
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-db-export-${Date.now()}.json`;
    a.click();
  };

  const toggleExpand = (record) => {
    setExpandedRecord(expandedRecord === record ? null : record);
  };

  const formatValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value).substring(0, 100) + '...';
    }
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Studio IndexedDB Browser</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.stats}>
            {Object.entries(stats).map(([store, count]) => (
              <div key={store} style={styles.statItem}>
                <span style={styles.label}>{store}</span>
                <span style={styles.value}>{count}</span>
              </div>
            ))}
            <div style={styles.statItem}>
              <span style={styles.label}>Pending Syncs</span>
              <span style={styles.value}>{pendingCount}</span>
            </div>
          </div>

          <div style={styles.controls}>
            <select
              style={styles.select}
              value={selectedStore}
              onChange={(e) => loadStore(e.target.value)}
            >
              <option value="">Select store...</option>
              {stores.map(s => (
                <option key={s} value={s}>{s} ({stats[s] || 0})</option>
              ))}
            </select>

            <button style={styles.button} onClick={() => loadStore(selectedStore)}>
              Refresh
            </button>

            <button style={styles.button} onClick={handleExport}>
              Export All to JSON
            </button>

            <button style={styles.dangerButton} onClick={handleClearAll}>
              Clear All Data
            </button>
          </div>

          {records.length > 0 && (
            <>
              <h3>{selectedStore} ({records.length} records)</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(records[0]).map(k => (
                      <th key={k} style={styles.th}>{k}</th>
                    ))}
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        {Object.entries(record).map(([key, value], j) => (
                          <td key={j} style={styles.td}>
                            {typeof value === 'object' ? (
                              <span
                                style={styles.json}
                                onClick={() => toggleExpand(record)}
                              >
                                {formatValue(value)}
                              </span>
                            ) : (
                              formatValue(value)
                            )}
                          </td>
                        ))}
                        <td style={styles.td}>
                          <button
                            style={styles.button}
                            onClick={() => deleteRecord(selectedStore, record.idbID)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedRecord === record && (
                        <tr>
                          <td colSpan={Object.keys(record).length + 1} style={{...styles.td, backgroundColor: '#f5f5f5'}}>
                            <pre style={{fontSize: '11px', overflow: 'auto', maxHeight: '400px'}}>
                              {JSON.stringify(record, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {selectedStore && records.length === 0 && (
            <p style={{marginTop: '20px', color: '#666'}}>No records in {selectedStore}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DBBrowserModal;
