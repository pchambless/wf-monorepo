
export default function formatSqlValue(value) {
  if (value === undefined || value === null) {
    return 'NULL';
  } else if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  } else {
    // Escape single quotes for SQL and wrap in quotes
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}
