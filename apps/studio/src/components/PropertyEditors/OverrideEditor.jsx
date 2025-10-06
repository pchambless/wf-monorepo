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

      {/* Single row layout - all inputs horizontal */}
      <div style={styles.compactRow}>
        <div style={styles.compactField}>
          <label style={styles.compactLabel}>Label</label>
          <input
            type="text"
            value={editedOverride.label || editedOverride.header || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder={currentHeader || fieldName}
            style={styles.compactInput}
          />
        </div>

        {componentType === 'Grid' && (
          <div style={styles.compactField}>
            <label style={styles.compactLabel}>Width</label>
            <input
              type="text"
              value={editedOverride.width || ''}
              onChange={(e) => handleChange('width', e.target.value)}
              placeholder="auto"
              style={styles.compactInput}
            />
          </div>
        )}

        {componentType === 'Form' && (
          <>
            <div style={styles.compactField}>
              <label style={styles.compactLabel}>Row</label>
              <input
                type="number"
                value={editedOverride.row || ''}
                onChange={(e) => handleChange('row', e.target.value)}
                placeholder="1"
                style={styles.compactInput}
              />
            </div>
            <div style={styles.compactField}>
              <label style={styles.compactLabel}>Column</label>
              <input
                type="number"
                value={editedOverride.col || ''}
                onChange={(e) => handleChange('col', e.target.value)}
                placeholder="1"
                style={styles.compactInput}
              />
            </div>
          </>
        )}

        <div style={styles.checkboxContainer}>
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
  compactRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  compactField: {
    flex: '1 1 auto',
    minWidth: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  compactLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  compactInput: {
    padding: '6px 8px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#1e293b',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    paddingLeft: '8px',
    borderLeft: '1px solid #e2e8f0',
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
