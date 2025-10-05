import React, { useState, useEffect } from 'react';

const OverrideEditor = ({ column, override, onSave, onReset, componentType = 'Grid' }) => {
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
    const fieldName = column.field || column.name;
    onSave(fieldName, editedOverride);
  };

  const handleReset = () => {
    setEditedOverride({});
    const fieldName = column.field || column.name;
    onReset(fieldName);
  };

  if (!column) {
    return (
      <div style={styles.empty}>
        Select a column to edit overrides
      </div>
    );
  }

  const fieldName = column.field || column.name;
  const currentHeader = column.header || column.label;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>✏️ Overrides (editable)</h3>

      <div style={styles.fields}>
        <div style={styles.field}>
          <label style={styles.label}>Label</label>
          <input
            type="text"
            value={editedOverride.label || editedOverride.header || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder={currentHeader || fieldName}
            style={styles.input}
          />
        </div>

        {componentType === 'Grid' && (
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
        )}

        {componentType === 'Form' && (
          <>
            <div style={styles.fieldRow}>
              <div style={styles.fieldHalf}>
                <label style={styles.label}>Row</label>
                <input
                  type="number"
                  value={editedOverride.row || ''}
                  onChange={(e) => handleChange('row', e.target.value)}
                  placeholder="1"
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldHalf}>
                <label style={styles.label}>Column</label>
                <input
                  type="number"
                  value={editedOverride.col || ''}
                  onChange={(e) => handleChange('col', e.target.value)}
                  placeholder="1"
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Group</label>
              <input
                type="text"
                value={editedOverride.group || ''}
                onChange={(e) => handleChange('group', e.target.value)}
                placeholder="Basic Info"
                style={styles.input}
              />
            </div>
          </>
        )}

        <div style={styles.checkboxRow}>
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
              checked={editedOverride.required || false}
              onChange={() => handleCheckbox('required')}
            />
            <span>Required</span>
          </label>

          {componentType === 'Grid' && (
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={editedOverride.sortable || false}
                onChange={() => handleCheckbox('sortable')}
              />
              <span>Sortable</span>
            </label>
          )}
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.saveButton} onClick={handleSave}>
          💾 Save Override
        </button>
        <button style={styles.resetButton} onClick={handleReset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
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
  fieldRow: {
    display: 'flex',
    gap: '12px',
  },
  fieldHalf: {
    flex: 1,
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
  checkboxRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    paddingTop: '8px',
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

export default OverrideEditor;
