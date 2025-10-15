import React, { useState, useEffect } from 'react';
import { db } from '../../db/studioDb';

/**
 * Smart parameter editor for workflow triggers
 * Uses param_schema from triggers table to render appropriate inputs
 */
const ParamEditor = ({ action, currentParams, onSave, onCancel }) => {
  const [schema, setSchema] = useState(null);
  const [example, setExample] = useState(null);
  const [params, setParams] = useState(currentParams || '{}');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchema();
  }, [action]);

  const loadSchema = async () => {
    if (!action) return;

    const trigger = await db.triggers
      .where('name').equals(action)
      .first();

    if (trigger) {
      try {
        setSchema(JSON.parse(trigger.param_schema));
        setExample(trigger.example);
      } catch (err) {
        console.error('Failed to parse param_schema:', err);
      }
    }
  };

  const handleSave = () => {
    try {
      // Validate JSON
      JSON.parse(params);
      onSave(params);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  if (!schema) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Edit Parameters</h3>
        <div style={styles.basicEditor}>
          <label style={styles.label}>Parameters (JSON):</label>
          <textarea
            value={params}
            onChange={(e) => setParams(e.target.value)}
            style={styles.textarea}
            rows={6}
          />
          {error && <div style={styles.error}>{error}</div>}
        </div>
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleSave} style={styles.saveButton}>Save</button>
        </div>
      </div>
    );
  }

  // TODO: Render smart form based on schema
  // For now, show JSON editor with schema reference

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Edit Parameters: {action}</h3>

      <div style={styles.schemaInfo}>
        <div style={styles.schemaLabel}>Schema Type: <strong>{schema.type}</strong></div>
        {schema.description && <div style={styles.description}>{schema.description}</div>}
        <div style={styles.schemaNote}>
          💡 Tip: Some actions accept multiple formats. See example below.
        </div>
      </div>

      <div style={styles.editorSection}>
        <label style={styles.label}>Parameters (JSON):</label>
        <textarea
          value={params}
          onChange={(e) => {
            setParams(e.target.value);
            setError(null);
          }}
          style={styles.textarea}
          rows={8}
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>

      {example && (
        <div style={styles.exampleSection}>
          <div style={styles.exampleLabel}>Example:</div>
          <pre style={styles.exampleCode}>{example}</pre>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
        <button onClick={handleSave} style={styles.saveButton}>Save</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fff',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
  },
  schemaInfo: {
    padding: '12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '13px',
  },
  schemaLabel: {
    marginBottom: '4px',
  },
  description: {
    color: '#64748b',
    fontSize: '12px',
  },
  schemaNote: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#3b82f6',
    fontStyle: 'italic',
  },
  basicEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  textarea: {
    fontFamily: 'monospace',
    fontSize: '13px',
    padding: '8px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    resize: 'vertical',
  },
  error: {
    color: '#dc2626',
    fontSize: '12px',
    padding: '8px',
    backgroundColor: '#fee2e2',
    borderRadius: '4px',
  },
  exampleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  exampleLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  exampleCode: {
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    overflow: 'auto',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
  },
  cancelButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
  saveButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
  },
};

export default ParamEditor;
