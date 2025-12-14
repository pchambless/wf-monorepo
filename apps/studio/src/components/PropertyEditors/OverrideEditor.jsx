import React, { useState, useEffect } from 'react';

// Common component types for forms
const COMPONENT_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'MultiLine', label: 'Multi-line (textarea)' },
  { value: 'H4', label: 'H4 Header' },
  { value: 'H3', label: 'H3 Header' },
  { value: 'SelBrand', label: 'Brand Selector' },
  { value: 'SelVendor', label: 'Vendor Selector' },
  { value: 'SelMeasure', label: 'Measure Selector' },
];

const OverrideEditor = ({ column, override, onSave, onReset, componentType = 'Grid' }) => {
  const [editedOverride, setEditedOverride] = useState({});

  useEffect(() => {
    let parsedOverride = { ...(override || {}) };

    // Parse colPos back into individual fields for editing
    if (parsedOverride.colPos && componentType === 'Form') {
      const [row, col, colSpan, compType] = parsedOverride.colPos.split(',');
      parsedOverride.row = row;
      parsedOverride.col = col;
      parsedOverride.colSpan = colSpan;
      parsedOverride.componentType = compType?.trim();
    }

    setEditedOverride(parsedOverride);
  }, [column, override, componentType]);

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
    const fieldName = column.name;

    // Build colPos from individual fields if this is a Form override
    let finalOverride = { ...editedOverride };
    if (componentType === 'Form' && (editedOverride.row || editedOverride.col || editedOverride.colSpan || editedOverride.componentType)) {
      const row = editedOverride.row || '1';
      const col = editedOverride.col || '1';
      const colSpan = editedOverride.colSpan || '1';
      const compType = editedOverride.componentType || 'text';

      finalOverride.colPos = `${row},${col},${colSpan},${compType}`;

      // Remove individual fields since colPos replaces them
      delete finalOverride.row;
      delete finalOverride.col;
      delete finalOverride.colSpan;
      delete finalOverride.componentType;
    }

    onSave(fieldName, finalOverride);
  };

  const handleReset = () => {
    setEditedOverride({});
    const fieldName = column.name;
    onReset(fieldName);
  };

  if (!column) {
    return (
      <div style={styles.empty}>
        Select a column to edit overrides
      </div>
    );
  }

  const fieldName = column.name;
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
            <div style={styles.compactField}>
              <label style={styles.compactLabel}>Col Span</label>
              <input
                type="number"
                value={editedOverride.colSpan || ''}
                onChange={(e) => handleChange('colSpan', e.target.value)}
                placeholder="1"
                style={styles.compactInput}
              />
            </div>
            <div style={styles.compactField}>
              <label style={styles.compactLabel}>Component Type</label>
              <select
                value={editedOverride.componentType || 'text'}
                onChange={(e) => handleChange('componentType', e.target.value)}
                style={styles.compactInput}
              >
                {COMPONENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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

          {componentType === 'Form' && (
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={editedOverride.required || false}
                onChange={() => handleCheckbox('required')}
              />
              <span>Required</span>
            </label>
          )}

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
