import React, { useState, useEffect } from 'react';

const ColumnEditor = ({ column, override, onSave, onReset }) => {
  const [editedOverride, setEditedOverride] = useState({});

  useEffect(() => {
    setEditedOverride(override || {});
  }, [column, override]);

  const handleChange = (field, value) => {
    setEditedOverride(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckbox = (field) => {
    setEditedOverride(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    onSave(column.name, editedOverride);
  };

  const handleReset = () => {
    setEditedOverride({});
    onReset(column.name);
  };

  if (!column) return null;

  return (
    <div style={styles.editor}>
      <div style={styles.header}>
        <span style={styles.icon}>✏️</span>
        <span style={styles.title}>Edit Column: {column.name}</span>
      </div>

      <div style={styles.fields}>
        <div style={styles.field}>
          <label style={styles.label}>Label</label>
          <input
            type="text"
            value={editedOverride.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder={column.name}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Width</label>
          <input
            type="text"
            value={editedOverride.width || ''}
            onChange={(e) => handleChange('width', e.target.value)}
            placeholder="auto"
            style={styles.input}
          />
        </div>

        <div style={styles.checkboxRow}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={editedOverride.required || false}
              onChange={() => handleCheckbox('required')}
            />
            <span>Required</span>
          </label>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={editedOverride.hidden || false}
              onChange={() => handleCheckbox('hidden')}
            />
            <span>Hidden</span>
          </label>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={editedOverride.sortable || false}
              onChange={() => handleCheckbox('sortable')}
            />
            <span>Sortable</span>
          </label>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Format</label>
          <select
            value={editedOverride.format || 'text'}
            onChange={(e) => handleChange('format', e.target.value)}
            style={styles.select}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="datetime">DateTime</option>
            <option value="currency">Currency</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.saveButton} onClick={handleSave}>
          💾 Save Column
        </button>
        <button style={styles.resetButton} onClick={handleReset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

const styles = {
  editor: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  icon: {
    fontSize: '18px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1e293b',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  checkboxRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
  },
  saveButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetButton: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default ColumnEditor;
