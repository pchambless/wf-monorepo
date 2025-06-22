export default function genDmlHtml(systemConfig, dmlConfig, sampleData) {
  if (!dmlConfig || !dmlConfig.fieldMappings) {
    return '<p><em>No DML configuration available for this entity</em></p>';
  }
  
  if (!sampleData || !sampleData.length) {
    return '<p><em>No sample data available for DML preview</em></p>';
  }
  
  const sampleRecord = sampleData[0];
  const primaryKey = systemConfig?.primaryKey;
  
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
        ${Object.entries(dmlConfig.fieldMappings).map(([field, dbColumn]) => `
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
INSERT INTO ${systemConfig?.schema || 'schema'}.${systemConfig?.table || 'table'}
(${Object.entries(dmlConfig.fieldMappings)
    .filter(([field]) => !(dmlConfig.operations?.insert?.excludeFields || []).includes(field))
    .map(([_, dbCol]) => dbCol)
    .join(', ')})
VALUES
(${Object.entries(dmlConfig.fieldMappings)
    .filter(([field]) => !(dmlConfig.operations?.insert?.excludeFields || []).includes(field))
    .map(([field]) => formatSqlValue(sampleRecord[field]))
    .join(', ')});
    </pre>
  </div>
  
  <!-- UPDATE Example -->
  <div class="dml-operation">
    <h3>UPDATE Example</h3>
    <pre class="sql-preview">
UPDATE ${systemConfig?.schema || 'schema'}.${systemConfig?.table || 'table'}
SET 
  ${Object.entries(dmlConfig.fieldMappings)
    .filter(([field]) => field !== primaryKey)
    .map(([field, dbCol]) => `${dbCol} = ${formatSqlValue(sampleRecord[field])}`)
    .join(',\n  ')}
WHERE 
  ${dmlConfig.fieldMappings[primaryKey]} = ${formatSqlValue(sampleRecord[primaryKey])};
    </pre>
  </div>
  
  <!-- DELETE Example -->
  <div class="dml-operation">
    <h3>DELETE Example</h3>
    <pre class="sql-preview">
DELETE FROM ${systemConfig?.schema || 'schema'}.${systemConfig?.table || 'table'}
WHERE 
  ${dmlConfig.fieldMappings[primaryKey]} = ${formatSqlValue(sampleRecord[primaryKey])};
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
