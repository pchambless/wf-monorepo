import React, { useState, useEffect } from 'react';
import { execEvent } from '@whatsfresh/shared-imports';
import { db } from '../../db/studioDb';

const QuerySetup = ({ component, onGenerateFields, onSaveFields }) => {
  const [queryName, setQueryName] = useState('');
  const [querySQL, setQuerySQL] = useState('');
  const [tableName, setTableName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [availableQueries, setAvailableQueries] = useState([]);

  // Load available queries from eventSQL (master table)
  useEffect(() => {
    const loadQueries = async () => {
      try {
        const queries = await db.eventSQL
          .orderBy('qryName')
          .toArray();
        setAvailableQueries(queries);
      } catch (error) {
        console.error('Failed to load queries:', error);
      }
    };

    loadQueries();
  }, []);

  // Fetch existing query on mount
  useEffect(() => {
    const fetchExistingQuery = async () => {
      try {
        // Query vw_eventSQL to find associated query
        const result = await execEvent('studio-getEventSQL', { xrefID: component.xref_id });
        if (result.data && result.data.length > 0) {
          const eventSQL = result.data[0];
          setQueryName(eventSQL.qryName || '');
          setQuerySQL(eventSQL.qrySQL || '');
          // Try to detect table name from SQL
          const tableMatch = eventSQL.qrySQL?.match(/FROM\s+(\w+\.\w+|\w+)/i);
          if (tableMatch) {
            setTableName(tableMatch[1]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch existing query:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingQuery();
  }, [component.xref_id]);

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

  const handleTestQuery = () => {
    console.log('Testing query:', queryName);
    alert('Query test functionality coming soon...');
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
          <label style={styles.label}>Query Name</label>
          <div style={styles.inputRow}>
            <select
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            >
              <option value="">Select a query...</option>
              {availableQueries.map((query) => (
                <option key={query.qryName} value={query.qryName}>
                  {query.qryName}
                </option>
              ))}
            </select>
            {!hasExistingQuery && (
              <button style={styles.newButton}>+ New</button>
            )}
          </div>
          <div style={styles.hint}>
            {hasExistingQuery
              ? 'Query detected from onRefresh trigger'
              : 'Select from existing queries or create new'}
          </div>
        </div>

        {querySQL && (
          <div style={styles.field}>
            <label style={styles.label}>Current SQL</label>
            <textarea
              value={querySQL}
              readOnly
              style={styles.sqlDisplay}
              rows={10}
            />
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
          >
            🧪 Test Query
          </button>
        </div>
      </div>
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
