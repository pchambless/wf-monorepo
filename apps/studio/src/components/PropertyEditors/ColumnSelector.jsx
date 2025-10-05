import React from 'react';

const ColumnSelector = ({ columns, selectedColumn, onSelect }) => {
  if (!columns || columns.length === 0) {
    return (
      <div style={styles.empty}>
        No columns defined. Generate fields from query first.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Select Column</h3>
      <div style={styles.pillsContainer}>
        {columns.map((column, idx) => {
          const fieldName = column.field || column.name;
          const isSelected = selectedColumn?.field === fieldName || selectedColumn?.name === fieldName;

          return (
            <button
              key={fieldName || idx}
              style={{
                ...styles.pill,
                ...(isSelected ? styles.pillSelected : {}),
              }}
              onClick={() => onSelect(column)}
            >
              <span style={styles.radio}>{isSelected ? '●' : '○'}</span>
              {fieldName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  pillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pillSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
  },
  radio: {
    fontSize: '12px',
    color: '#3b82f6',
  },
};

export default ColumnSelector;
