const fs = require('fs').promises;
const path = require('path');

async function generateVisualDocs() {
  console.log('Starting visual documentation generation...');
  
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../Docs/pagePreviews');
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Output directory created/verified: ${outputDir}`);
    
    // Load entity registry
    const { entityRegistry } = require('@whatsfresh/shared-config/src/pageMapRegistry.js');
    console.log(`Loaded entity registry with ${Object.keys(entityRegistry).length} entities`);
    
    // Process each entity
    for (const [entityName, entity] of Object.entries(entityRegistry)) {
      try {
        console.log(`Processing ${entityName}...`);
        
        // Load the pageMap configuration
        const pageMapPath = path.resolve(__dirname, `../../packages/shared-config/src/pageMap/${entityName}.js`);
        const pageMap = require(pageMapPath).default;
        
        // Generate sample data
        const sampleData = await getSampleData(entityName, pageMap) || [];
        
        // Generate HTML for this entity
        const html = generateEntityHtml(entityName, pageMap, sampleData);
        
        // Save HTML file
        const outputPath = path.join(outputDir, `${entityName}.html`);
        await fs.writeFile(outputPath, html);
        console.log(`✅ Generated ${entityName}.html`);
      } catch (err) {
        console.error(`❌ Error generating ${entityName}.html: ${err.message}`);
      }
    }
    
    console.log('✅ Visual documentation generation complete!');
  } catch (err) {
    console.error('❌ Fatal error in documentation generation:', err);
  }
}

async function getSampleData(entityName, pageMap) {
  const fs = require('fs').promises;
  const path = require('path');
  
  // First try to load real sample data
  const samplePath = path.join(__dirname, '../../samples', `${entityName}.json`);
  
  try {
    // Check if sample file exists
    const stats = await fs.stat(samplePath);
    if (stats.isFile()) {
      console.log(`Using real sample data from ${samplePath}`);
      const sampleContent = await fs.readFile(samplePath, 'utf8');
      const allSamples = JSON.parse(sampleContent);
      
      // Limit to first 3 rows for display purposes
      return allSamples.slice(0, 3);
    }
  } catch (err) {
    // File doesn't exist or other error, fall back to generated data
    console.log(`No sample file found at ${samplePath}, generating mock data`);
  }
  
  // Fall back to generated mock data
  console.log(`Generating mock data for ${entityName}`);
  return generateMockData(entityName, pageMap);
}

function generateMockData(entityName, pageMap) {
  try {
    const mockData = [];
    
    // Create 3 mock records
    for (let i = 1; i <= 3; i++) {
      const record = {};
      
      // Add primary key
      if (pageMap.systemConfig?.primaryKey) {
        record[pageMap.systemConfig.primaryKey] = i;
      }
      
      // Add fields from tableConfig
      if (pageMap.tableConfig?.columns) {
        pageMap.tableConfig.columns.forEach(column => {
          record[column.field] = getMockValueForField(column.field, column.type, i);
        });
      }
      
      // Add fields from formConfig groups
      if (pageMap.formConfig?.groups) {
        pageMap.formConfig.groups.forEach(group => {
          group.fields.forEach(field => {
            if (!record.hasOwnProperty(field.field)) {
              record[field.field] = getMockValueForField(field.field, field.type, i);
            }
          });
        });
      }
      
      mockData.push(record);
    }
    
    return mockData;
  } catch (err) {
    console.warn(`⚠️ Error generating mock data for ${entityName}:`, err.message);
    return [];
  }
}

function getMockValueForField(fieldName, fieldType, index) {
  const type = fieldType || 'text';
  
  // Handle common field name patterns
  if (fieldName.endsWith('ID') || fieldName.endsWith('Id')) {
    return index;
  }
  
  if (fieldName.includes('name') || fieldName.includes('Name')) {
    return `Sample ${fieldName.replace(/([A-Z])/g, ' $1').trim()} ${index}`;
  }
  
  if (fieldName.includes('desc') || fieldName.includes('Desc')) {
    return `This is a sample description for record ${index}.`;
  }
  
  if (fieldName.includes('price') || fieldName.includes('Price')) {
    return (19.99 * index).toFixed(2);
  }
  
  if (fieldName.includes('date') || fieldName.includes('Date')) {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  }
  
  if (fieldName.includes('qty') || fieldName.includes('Qty')) {
    return index * 5;
  }
  
  // Type-based defaults
  switch (type) {
    case 'number': return index * 10;
    case 'decimal': return (index * 10.5).toFixed(2);
    case 'boolean': return index % 2 === 0;
    case 'date': return new Date().toISOString().split('T')[0];
    case 'multiLine': return `Sample multi-line text.\nThis is line ${index}.\nThis is another line.`;
    default: return `Sample ${fieldName} ${index}`;
  }
}

function generateEntityHtml(entityName, pageMap, sampleData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageMap.title || entityName} Preview</title>
  ${getCSS()}
  <script>
    function toggleView(view) {
      const tableSection = document.getElementById('table-section');
      const formSection = document.getElementById('form-section');
      const dmlSection = document.getElementById('dml-section');
      
      const tableBtn = document.querySelector('.table-btn');
      const formBtn = document.querySelector('.form-btn');
      const dmlBtn = document.querySelector('.dml-btn');
      
      // Hide all sections
      tableSection.style.display = 'none';
      formSection.style.display = 'none';
      dmlSection.style.display = 'none';
      
      // Remove active class from all buttons
      tableBtn.classList.remove('active');
      formBtn.classList.remove('active');
      dmlBtn.classList.remove('active');
      
      // Show selected section and activate button
      if (view === 'table') {
        tableSection.style.display = 'block';
        tableBtn.classList.add('active');
      } else if (view === 'form') {
        formSection.style.display = 'block';
        formBtn.classList.add('active');
      } else if (view === 'dml') {
        dmlSection.style.display = 'block';
        dmlBtn.classList.add('active');
      } else if (view === 'all') {
        tableSection.style.display = 'block';
        formSection.style.display = 'block';
        dmlSection.style.display = 'block';
      }
    }
  </script>
</head>
<body>
  <h1>${pageMap.title || entityName} Component Preview</h1>
  <p><em>Visual preview based on pageMap configuration - Generated on ${new Date().toLocaleDateString()}</em></p>
  
  <div class="controls">
    <button class="toggle-btn table-btn active" onclick="toggleView('table')">Table View</button>
    <button class="toggle-btn form-btn" onclick="toggleView('form')">Form View</button>
    <button class="toggle-btn dml-btn" onclick="toggleView('dml')">DML View</button>
    <button class="toggle-btn" onclick="toggleView('all')">Show All</button>
  </div>
  
  <div class="directive-list">
    <h3>Entity Configuration Overview</h3>
    <p><strong>Schema:</strong> ${pageMap.systemConfig?.schema || 'Not specified'}</p>
    <p><strong>Table:</strong> ${pageMap.systemConfig?.table || 'Not specified'}</p>
    <p><strong>Primary Key:</strong> ${pageMap.systemConfig?.primaryKey || 'Not specified'}</p>
  </div>
  
  <div class="preview-container">
    <div id="table-section" class="preview-section">
      <h2>Table View</h2>
      ${generateTableHtml(pageMap.tableConfig, sampleData)}
    </div>
    
    <div id="form-section" class="preview-section" style="display: none;">
      <h2>Form View</h2>
      ${generateFormHtml(pageMap.formConfig, sampleData[0] || {})}
    </div>
    
    <div id="dml-section" class="preview-section" style="display: none;">
      <h2>DML Preview</h2>
      ${generateDmlHtml(pageMap.systemConfig, pageMap.dmlConfig, sampleData)}
    </div>
  </div>
</body>
</html>`;
}

function generateTableHtml(tableConfig, sampleData) {
  if (!tableConfig || !tableConfig.columns || tableConfig.columns.length === 0) {
    return '<p><em>No table configuration available for this entity</em></p>';
  }
  
  if (!sampleData || sampleData.length === 0) {
    return '<p><em>No sample data available for table preview</em></p>';
  }
  
  // Generate table headers
  const headers = tableConfig.columns.map(col => 
    `<th>${col.label || col.field}</th>`
  ).join('');
  
  // Generate table rows
  const rows = sampleData.map(record => {
    const cells = tableConfig.columns.map(col => {
      const value = record[col.field] !== undefined && record[col.field] !== null 
        ? record[col.field] 
        : '';
      return `<td>${value}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
<table>
  <thead>
    <tr>${headers}</tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
}

function generateFormHtml(formConfig, sampleRecord) {
  if (!formConfig) {
    return '<p><em>No form configuration available for this entity</em></p>';
  }
  
  if (!sampleRecord) {
    return '<p><em>No sample data available for form preview</em></p>';
  }
  
  // Handle the groups-only approach
  if (formConfig.groups && formConfig.groups.length > 0) {
    const groupsHtml = formConfig.groups.map(group => {
      const fieldsHtml = group.fields.map(field => {
        const value = sampleRecord[field.field] !== undefined && sampleRecord[field.field] !== null 
          ? sampleRecord[field.field] 
          : '';
        
        const required = field.required ? '<span class="required-marker">*</span>' : '';
        const fieldType = field.type ? `<span class="field-type">[${field.type}]</span>` : '';
        
        let fieldPreviewClass = 'field-preview';
        if (field.type === 'select') fieldPreviewClass += ' select-field';
        if (field.type === 'multiLine') fieldPreviewClass += ' multiLine-field';
        if (field.type === 'number' || field.type === 'decimal') fieldPreviewClass += ' number-field';
        
        return `
          <div class="form-field">
            <label>${field.label || field.field}${required} ${fieldType}</label>
            <div class="${fieldPreviewClass}">${value}</div>
          </div>`;
      }).join('');
      
      return `
        <div class="form-group">
          <div class="group-header">${group.title}</div>
          <div class="form-row">${fieldsHtml}</div>
        </div>`;
    }).join('');
    
    return `<div class="form-container">${groupsHtml}</div>`;
  }
  
  // Fallback for legacy formConfig with just fields
  if (formConfig.fields && formConfig.fields.length > 0) {
    // Render all fields in a single group
    const fields = formConfig.fields.map(field => {
      const value = sampleRecord[field.field] !== undefined && sampleRecord[field.field] !== null 
        ? sampleRecord[field.field] 
        : '';
    
      const required = field.required ? '<span class="required-marker">*</span>' : '';
      const fieldType = field.type ? `<span class="field-type">[${field.type}]</span>` : '';
    
      let fieldPreviewClass = 'field-preview';
      if (field.type === 'select') fieldPreviewClass += ' select-field';
      if (field.type === 'multiLine') fieldPreviewClass += ' multiLine-field';
      if (field.type === 'number' || field.type === 'decimal') fieldPreviewClass += ' number-field';
    
      return `
        <div class="form-field">
          <label>${field.label || field.field}${required} ${fieldType}</label>
          <div class="${fieldPreviewClass}">${value}</div>
        </div>`;
    }).join('');
  
    return `<div class="form-container"><div class="form-group"><div class="form-row">
    ${fields}</div></div></div>`;
  }
  
  return '<p><em>No form fields defined for this entity</em></p>';
}

function generateDmlHtml(systemConfig, dmlConfig, sampleData) {
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

function getCSS() {
  return `<style>
  /* Base styles */
  body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.5; }
  h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  h2 { color: #3498db; margin-top: 25px; }
  
  /* Layout */
  .preview-container { display: flex; flex-wrap: wrap; gap: 30px; margin-top: 20px; }
  .preview-section { flex: 1; min-width: 400px; border: 1px solid #ddd; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  
  /* Toggle controls */
  .controls { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
  .toggle-btn { background: #4a90e2; color: white; border: none; border-radius: 4px; padding: 8px 15px; margin-right: 10px; cursor: pointer; }
  .toggle-btn:hover { background: #3a7bc8; }
  .toggle-btn.active { background: #2c5e8e; }
  
  /* Directive info */
  .directive-list { margin-top: 20px; background: #f1f8ff; padding: 15px; border-left: 4px solid #3498db; }
  .directive { margin-bottom: 5px; font-family: monospace; }
  
  /* Table styling */
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
  th { background-color: #f6f8fa; font-weight: bold; }
  tr:nth-child(even) { background-color: #f9f9f9; }
  
  /* Form styling */
  .form-container { padding: 10px 0; }
  .form-group { margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
  .group-header { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; color: #555; background: #f5f5f5; padding: 5px; }
  .form-row { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 15px; }
  .form-field { flex: 1; min-width: 200px; }
  label { display: block; font-weight: bold; margin-bottom: 8px; color: #555; }
  .field-preview { padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
  .multiLine-field { height: 80px; }
  .select-field { position: relative; }
  .select-field:after { content: "▼"; position: absolute; right: 10px; top: 10px; color: #777; }
  .checkbox-field { display: flex; align-items: center; }
  .checkbox-preview { width: 20px; height: 20px; border: 1px solid #999; border-radius: 3px; margin-right: 10px; }
  .number-field { color: #1565c0; }
  .required-marker { color: #e53935; margin-left: 3px; }
  .field-type { font-size: 0.8em; color: #777; margin-left: 5px; }
  
  /* DML styling */
  .dml-preview { margin-top: 20px; }
  .mapping-section { margin-bottom: 25px; }
  .dml-operation { margin-bottom: 30px; }
  .sql-preview { 
    background: #f5f5f5; 
    padding: 15px; 
    border-left: 4px solid #3498db; 
    font-family: monospace;
    white-space: pre-wrap;
    overflow-x: auto;
  }
</style>`;
}

// Run the generator
generateVisualDocs().catch(err => {
  console.error('Fatal error:', err);
});