import React, { useState, useEffect } from 'react';

const PreviewPane = ({ column, override, onChange }) => {
  const [previewJson, setPreviewJson] = useState('{}');

  useEffect(() => {
    if (!column) {
      setPreviewJson('{}');
      return;
    }

    // Merge column schema with overrides
    const merged = {
      ...column,
      ...(override || {})
    };

    setPreviewJson(JSON.stringify(merged, null, 2));
  }, [column, override]);

  if (!column) {
    return (
      <div style={styles.empty}>
        Select a column to preview
      </div>
    );
  }

  const handleEdit = (e) => {
    setPreviewJson(e.target.value);

    // Try to parse and notify parent
    try {
      const parsed = JSON.parse(e.target.value);
      onChange && onChange(parsed);
    } catch (err) {
      // Invalid JSON - don't update
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>👁️ Preview (editable)</h3>
      <textarea
        value={previewJson}
        onChange={handleEdit}
        style={styles.textarea}
        rows={15}
        spellCheck={false}
      />
      <div style={styles.hint}>
        Edit JSON directly or use overrides above. Valid JSON will save.
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    resize: 'vertical',
  },
  hint: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
  },
};

export default PreviewPane;
