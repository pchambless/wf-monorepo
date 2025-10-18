import React, { useState, useEffect } from 'react';
import { db } from '../../db/studioDb';

/**
 * Smart parameter editor for workflow triggers
 * Uses param_schema from triggers table to render appropriate inputs
 */
const ParamEditor = ({ action, currentParams, onSave, onCancel }) => {
  const [contentType, setContentType] = useState('json');
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
      setContentType(trigger.content_type || 'json');
      setExample(trigger.example);
    }
  };

  const handleSave = () => {
    const trimmed = params.trim();

    if (contentType === 'string') {
      // Plain string - no JSON validation required
      onSave(trimmed);
    } else if (contentType === 'number') {
      // Validate number
      if (isNaN(trimmed)) {
        setError('Invalid number');
        return;
      }
      onSave(trimmed);
    } else {
      // JSON validation required (object or array)
      try {
        const parsed = JSON.parse(trimmed);

        // Validate type matches
        if (contentType === 'array' && !Array.isArray(parsed)) {
          setError('Expected array format: [...]');
          return;
        }
        if (contentType === 'object' && (Array.isArray(parsed) || typeof parsed !== 'object')) {
          setError('Expected object format: {...}');
          return;
        }

        onSave(trimmed);
      } catch (err) {
        setError(`Invalid JSON: ${err.message}`);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Edit Parameters: {action}</h3>

      <div style={styles.schemaInfo}>
        <div style={styles.schemaLabel}>Content Type: <strong>{contentType}</strong></div>
        <div style={styles.schemaNote}>
          💡 {contentType === 'string' && 'Enter a plain string (no quotes needed)'}
          {contentType === 'number' && 'Enter a numeric value'}
          {contentType === 'object' && 'Enter a JSON object: {...}'}
          {contentType === 'array' && 'Enter a JSON array: [...]'}
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
          <div style={styles.exampleHeader}>
            <div style={styles.exampleLabel}>Example:</div>
            <button
              onClick={() => setParams(example)}
              style={styles.useTemplateButton}
              title="Copy example to editor"
            >
              📋 Use Template
            </button>
          </div>
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
  exampleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  useTemplateButton: {
    padding: '4px 12px',
    fontSize: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#3b82f6',
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
