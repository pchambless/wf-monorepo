import React from 'react';

const ColumnList = ({ columns, overrides, selectedColumn, onSelect }) => {
  if (!columns || columns.length === 0) {
    return (
      <div style={styles.empty}>
        No columns defined. Generate fields from query first.
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {columns.map((column, idx) => {
        const fieldName = column.field || column.name;
        const override = overrides?.[fieldName] || {};
        const isSelected = selectedColumn?.field === fieldName || selectedColumn?.name === fieldName;
        const currentHeader = column.header || column.label;
        const currentWidth = column.width;
        const currentHidden = column.hidden;

        const hasBadges = override.header || override.width || override.hidden || currentWidth || currentHidden;

        return (
          <div
            key={fieldName || idx}
            style={{
              ...styles.columnItem,
              ...(isSelected ? styles.columnItemSelected : {}),
            }}
            onClick={() => onSelect(column)}
          >
            <div style={styles.columnHeader}>
              <span style={styles.radio}>{isSelected ? '●' : '○'}</span>
              <span style={styles.columnName}>{fieldName}</span>
              {column.type && <span style={styles.columnType}>({column.type})</span>}

              {hasBadges && (
                <div style={styles.badges}>
                  {currentHeader && (
                    <span style={styles.badge}>🏷️ "{currentHeader}"</span>
                  )}
                  {currentWidth && (
                    <span style={styles.badge}>{currentWidth}</span>
                  )}
                  {currentHidden && (
                    <span style={styles.badgeHidden}>Hidden</span>
                  )}
                </div>
              )}
            </div>

            {column.dbAttribute && (
              <div style={styles.dbAttribute}>
                🔒 From query: {column.dbAttribute}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  columnItem: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
  },
  columnItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  radio: {
    fontSize: '16px',
    color: '#3b82f6',
  },
  columnName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#1e293b',
  },
  columnType: {
    fontSize: '12px',
    color: '#64748b',
  },
  badges: {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '2px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  badgeHidden: {
    padding: '2px 8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
  },
  dbAttribute: {
    marginTop: '4px',
    fontSize: '11px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
};

export default ColumnList;
