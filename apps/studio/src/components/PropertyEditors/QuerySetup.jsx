import React, { useState, useEffect } from 'react';
import { execEvent, setVals } from '../../utils/api';
import ColumnSelector from './ColumnSelector';
import OverrideEditor from './OverrideEditor';

const QuerySetup = ({ component, onGenerateFields, onSaveFields }) => {
  const [queryName, setQueryName] = useState('');
  const [queryTrigger, setQueryTrigger] = useState('');
  const [querySQL, setQuerySQL] = useState('');
  const [originalSQL, setOriginalSQL] = useState('');
  const [tableName, setTableName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // Fetch existing query on mount
  useEffect(() => {
    const fetchExistingQuery = async () => {
      try {
        const xrefID = component.xref_id || component.id;
        
        // Set xrefID in context_store first so the query can resolve it
        await setVals([{ paramName: 'xrefID', paramVal: xrefID }]);
        
        // Use getEventSQL query to get resolved query info from vw_eventSQL
        const result = await execEvent('getEventSQL', { xrefID });
        
        console.log('🔍 QuerySetup: getEventSQL result:', result);
        
        if (result.data && result.data.length > 0) {
          const eventSQL = result.data[0];
          console.log('✅ QuerySetup: Found query info:', eventSQL);
          
          // Show both resolved and template query names
          setQueryName(eventSQL.qryName || '');
          setQueryTrigger(eventSQL.qryTrigger || '');
          setQuerySQL(eventSQL.qrySQL || '');
          setOriginalSQL(eventSQL.qrySQL || '');
          
          // Try to detect table name from SQL
          const tableMatch = eventSQL.qrySQL?.match(/FROM\s+(\w+\.\w+|\w+)/i);
          if (tableMatch) {
            setTableName(tableMatch[1]);
          }
        } else {
          console.warn('⚠️ QuerySetup: No query found for this component');
        }
      } catch (error) {
        console.error('Failed to fetch existing query:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingQuery();
  }, [component.xref_id, component.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await onGenerateFields();

      if (result && result.fields) {
        // Ask user if they want to save
        const save = window.confirm(
          `Generated ${result.fields.length} fields. Save to component?`
        );

        if (save) {
          // Save the fields
          await onSaveFields(result.fields);
          alert(`Saved ${result.fields.length} fields successfully!`);
        }
      } else {
        alert('Fields generated successfully! Check console for details.');
      }
    } catch (error) {
      alert('Failed to generate fields: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditSQL = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setQuerySQL(originalSQL);
    setEditing(false);
  };

  const handleSaveSQL = async () => {
    try {
      setSaving(true);
      
      // Update the eventSQL table with new qrySQL
      const response = await fetch('http://localhost:3002/api/execDML', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          method: 'UPDATE',
          table: 'api_wf.eventSQL',
          data: {
            qryName: queryName,
            qrySQL: querySQL
          },
          primaryKey: { qryName: queryName }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOriginalSQL(querySQL);
        setEditing(false);
        alert('✅ Query updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update query');
      }
    } catch (error) {
      console.error('Failed to save query:', error);
      alert('Failed to save query: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestQuery = async () => {
    try {
      setTesting(true);
      
      // Execute the query using execEvent
      const response = await fetch('http://localhost:3002/api/execEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventSQLId: queryName,
          params: {}
        })
      });

      const result = await response.json();
      
      setTestResults(result);
      setShowTestModal(true);
    } catch (error) {
      console.error('Failed to test query:', error);
      alert('Failed to test query: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading query information...</div>;
  }

  const hasExistingQuery = !!queryName;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        {hasExistingQuery && (
          <div style={styles.statusBanner}>
            ✅ Query configured: <strong>{queryName}</strong>
          </div>
        )}
        <button
          style={styles.helpButton}
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? '✕ Close Help' : 'ℹ️ Help'}
        </button>
      </div>

      {showHelp && (
        <div style={styles.helpBox}>
          <strong>How it works:</strong>
          <ol style={styles.helpList}>
            <li>Ensure your component has a query configured</li>
            <li>Click "Generate Fields" to analyze the schema</li>
            <li>Fields will be created automatically based on column types</li>
            <li>Customize using the Props tab</li>
          </ol>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📋 Database Query Setup</h3>

        <div style={styles.field}>
          <label style={styles.label}>Resolved Query Name (Runtime)</label>
          <div style={styles.inputRow}>
            <input
              type="text"
              value={queryName}
              readOnly
              style={styles.inputDisabled}
              placeholder="No query configured"
            />
          </div>
          <div style={styles.hint}>
            {queryName 
              ? `This is the actual query that executes at runtime` 
              : 'No query configured. Add an onRefresh→execEvent trigger in the Triggers tab.'}
          </div>
        </div>

        {queryTrigger && (
          <div style={styles.field}>
            <label style={styles.label}>Template Query Name (Trigger)</label>
            <input
              type="text"
              value={queryTrigger}
              readOnly
              style={styles.inputDisabled}
            />
            <div style={styles.hint}>
              Template stored in trigger - resolves to "{queryName}" at runtime
            </div>
          </div>
        )}

        {querySQL && (
          <div style={styles.field}>
            <div style={styles.sqlHeader}>
              <label style={styles.label}>Current SQL</label>
              {!editing && (
                <button style={styles.editSQLButton} onClick={handleEditSQL}>
                  ✏️ Edit SQL
                </button>
              )}
            </div>
            <textarea
              value={querySQL}
              onChange={(e) => setQuerySQL(e.target.value)}
              readOnly={!editing}
              style={editing ? styles.sqlEdit : styles.sqlDisplay}
              rows={10}
            />
            {editing && (
              <div style={styles.sqlActions}>
                <button
                  style={styles.saveSQLButton}
                  onClick={handleSaveSQL}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving...' : '💾 Save SQL'}
                </button>
                <button
                  style={styles.cancelSQLButton}
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
            {querySQL !== originalSQL && !editing && (
              <div style={styles.unsavedWarning}>
                ⚠️ You have unsaved changes
              </div>
            )}
          </div>
        )}

        {tableName && (
          <div style={styles.field}>
            <label style={styles.label}>Detected Table/View</label>
            <input
              type="text"
              value={tableName}
              readOnly
              style={styles.inputDisabled}
            />
            <div style={styles.hint}>
              Auto-detected from query SQL
            </div>
          </div>
        )}

        <div style={styles.buttonRow}>
          <button
            style={styles.primaryButton}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '🔘 Generate Fields from Schema'}
          </button>
          <button
            style={styles.secondaryButton}
            onClick={handleTestQuery}
            disabled={testing || !queryName}
          >
            {testing ? '⏳ Testing...' : '🧪 Test Query'}
          </button>
        </div>
      </div>

      {/* Test Results Modal */}
      {showTestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTestModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🧪 Query Test Results</h3>
              <button style={styles.modalClose} onClick={() => setShowTestModal(false)}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              {testResults?.data ? (
                <>
                  <div style={styles.resultsSummary}>
                    ✅ Query executed successfully - {testResults.data.length} row(s) returned
                  </div>
                  <div style={styles.resultsTable}>
                    <pre style={styles.resultsJSON}>
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div style={styles.resultsError}>
                  ❌ Query failed: {testResults?.error || 'Unknown error'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  headerRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  statusBanner: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #86efac',
  },
  helpButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  helpBox: {
    padding: '16px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e40af',
  },
  helpList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  newButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sqlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  editSQLButton: {
    padding: '4px 12px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  sqlDisplay: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    resize: 'vertical',
  },
  sqlEdit: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #3b82f6',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    resize: 'vertical',
  },
  sqlActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  saveSQLButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelSQLButton: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  unsavedWarning: {
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
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
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
  },
  modalClose: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
    overflow: 'auto',
    flex: 1,
  },
  resultsSummary: {
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  resultsError: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
  },
  resultsTable: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '400px',
  },
  resultsJSON: {
    margin: 0,
    padding: '16px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    overflow: 'auto',
  },
  section: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
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
    cursor: 'not-allowed',
  },
  hint: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
  },
  primaryButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  actionSection: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
  },
  actionTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#92400e',
  },
  actionHint: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#78350f',
  },
  actionButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  actionInfo: {
    fontSize: '12px',
    color: '#78350f',
    lineHeight: '1.6',
  },
};

export default QuerySetup;
