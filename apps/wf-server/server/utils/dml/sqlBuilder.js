/**
 * Build INSERT SQL with audit fields
 */
const buildInsertSQL = (table, data, userID) => {
  const columns = [];
  const values = [];

  // Add user data (exclude userID and primary key 'id' for auto-increment)
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "userID" && key !== "id") {
      // Don't include userID or primary key in INSERT
      columns.push(key);
      values.push(formatValue(value));
    }
  });

  // Add audit fields
  columns.push("created_at", "created_by");
  values.push("NOW()", userID);

  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(
    ", "
  )})`;
};

/**
 * Build UPDATE SQL with audit fields
 */
const buildUpdateSQL = (table, data, primaryKey, userID) => {
  const setClauses = [];
  let whereValue;

  // Build SET clauses
  Object.entries(data).forEach(([key, value]) => {
    if (key === primaryKey) {
      whereValue = value;
    } else if (key !== "userID") {
      setClauses.push(`${key} = ${formatValue(value)}`);
    }
  });

  // Add audit fields
  setClauses.push("updated_at = NOW()", `updated_by = ${userID}`);

  return `UPDATE ${table} SET ${setClauses.join(
    ", "
  )} WHERE ${primaryKey} = ${formatValue(whereValue)}`;
};

/**
 * Build DELETE SQL
 */
const buildDeleteSQL = (table, data, primaryKey) => {
  const whereValue = data[primaryKey];
  return `DELETE FROM ${table} WHERE ${primaryKey} = ${formatValue(
    whereValue
  )}`;
};

/**
 * Build soft delete SQL with audit fields
 */
const buildSoftDeleteSQL = (table, data, primaryKey, userID) => {
  const whereValue = data[primaryKey];
  return `UPDATE ${table} SET deleted_at = NOW(), deleted_by = ${userID} WHERE ${primaryKey} = ${formatValue(
    whereValue
  )}`;
};

/**
 * Format value for SQL
 */
const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return String(value);
  }
  // Escape single quotes for strings
  return `'${String(value).replace(/'/g, "''")}'`;
};

export {
  buildInsertSQL,
  buildUpdateSQL,
  buildDeleteSQL,
  buildSoftDeleteSQL,
  formatValue,
};
