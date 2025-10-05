import React from 'react';

const SchemaViewer = ({ column }) => {
  if (!column) {
    return (
      <div style={styles.empty}>
        Select a column to view its database schema
      </div>
    );
  }

  const fieldName = column.field || column.name;
  const fieldType = column.type || 'unknown';
  const header = column.header || column.label || fieldName;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔒 Database Schema (read-only)</h3>
      <div style={styles.grid}>
        <div style={styles.row}>
          <span style={styles.label}>Field Name:</span>
          <span style={styles.value}>{fieldName}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Type:</span>
          <span style={styles.value}>{fieldType.toUpperCase()}</span>
        </div>
        {column.required !== undefined && (
          <div style={styles.row}>
            <span style={styles.label}>Required:</span>
            <span style={styles.value}>{column.required ? 'Yes' : 'No'}</span>
          </div>
        )}
        {column.primaryKey && (
          <div style={styles.row}>
            <span style={styles.label}>Primary Key:</span>
            <span style={styles.value}>Yes</span>
          </div>
        )}
        {column.maxLength && (
          <div style={styles.row}>
            <span style={styles.label}>Max Length:</span>
            <span style={styles.value}>{column.maxLength}</span>
          </div>
        )}
        {column.defaultValue !== undefined && (
          <div style={styles.row}>
            <span style={styles.label}>Default:</span>
            <span style={styles.value}>{column.defaultValue || '(none)'}</span>
          </div>
        )}
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
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
  },
  value: {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
};

export default SchemaViewer;
