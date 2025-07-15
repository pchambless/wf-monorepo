export default function genDmlHtml(metadata, dmlConfig, sampleData) {
  if (!dmlConfig || !dmlConfig.fieldMappings) {
    return '<p><em>No DML configuration available for this entity</em></p>';
  }

  const sampleRecord = sampleData?.[0] || {};
  const primaryKey = metadata?.primaryKey;
  const schema = metadata?.schema || 'whatsfresh';
  const tableName = metadata?.tableName || 'table';

  // Filter out invalid and duplicate field mappings
  const validFieldMappings = {};
  const usedDbColumns = new Set();

  Object.entries(dmlConfig.fieldMappings).forEach(([field, dbColumn]) => {
    // Skip invalid database columns
    if (!dbColumn ||
      dbColumn === 'END' ||
      dbColumn.includes(')') ||
      dbColumn.includes('COUNT(') ||
      usedDbColumns.has(dbColumn)) {
      return;
    }

    validFieldMappings[field] = dbColumn;
    usedDbColumns.add(dbColumn);
  });

  // Find the correct primary key mapping
  const primaryKeyDbColumn = validFieldMappings[primaryKey] ||
    Object.values(validFieldMappings).find(col => col === 'id') ||
    'id';

  return `
<div class="dml-preview">
  <!-- Field Mappings -->
  <div class="mapping-section">
    <h3>Field Mappings</h3>
    <table>
      <thead>
        <tr>
          <th>UI Field</th>
          <th>Database Column</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(validFieldMappings).map(([field, dbColumn]) => `
          <tr>
            <td>${field}</td>
            <td>${dbColumn}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <!-- INSERT Example -->
  <div class="dml-operation">
    <h3>INSERT Example</h3>
    <pre class="sql-preview">
INSERT INTO ${schema}.${tableName}
(${Object.entries(validFieldMappings)
      .filter(([field]) => !(dmlConfig.operations?.insert?.excludeFields || []).includes(field))
      .map(([_, dbCol]) => dbCol)
      .join(', ')})
VALUES
(${Object.entries(validFieldMappings)
      .filter(([field]) => !(dmlConfig.operations?.insert?.excludeFields || []).includes(field))
      .map(([field]) => formatSqlValue(sampleRecord[field]))
      .join(', ')});
    </pre>
  </div>
  
  <!-- UPDATE Example -->
  <div class="dml-operation">
    <h3>UPDATE Example</h3>
    <pre class="sql-preview">
UPDATE ${schema}.${tableName}
SET 
  ${Object.entries(validFieldMappings)
      .filter(([field]) => field !== primaryKey)
      .map(([field, dbCol]) => `${dbCol} = ${formatSqlValue(sampleRecord[field])}`)
      .join(',\n  ')}
WHERE 
  ${primaryKeyDbColumn} = ${formatSqlValue(sampleRecord[primaryKey] || 1)};
    </pre>
  </div>
  
  <!-- DELETE Example -->
  <div class="dml-operation">
    <h3>DELETE Example</h3>
    <pre class="sql-preview">
DELETE FROM ${schema}.${tableName}
WHERE 
  ${primaryKeyDbColumn} = ${formatSqlValue(sampleRecord[primaryKey] || 1)};
    </pre>
  </div>
</div>`;
}

function formatSqlValue(value) {
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
