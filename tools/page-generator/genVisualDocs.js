const fs = require('fs');  // Regular fs for existsSync
const fsPromises = require('fs').promises;  // Promise-based fs for async operations
const path = require('path');

async function generateVisualDocumentation() {
  const docsDir = path.resolve(__dirname, '../../docs/visual');
  await fsPromises.mkdir(docsDir, { recursive: true });
  
  const optimizedDir = path.resolve(__dirname, '../../packages/shared-config/src/optimized');
  const samplesDir = path.resolve(__dirname, '../../samples');
  
  // Make sure optimized configs exist
  if (!fs.existsSync(optimizedDir)) {
    console.log("Optimized configs not found, generating them first...");
    // Run the optimizer
    await require('./genOptimizedConfigs').generateOptimizedConfigs();
  }
  
  // Get all optimized config files
  const files = await fsPromises.readdir(optimizedDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  // Create index page
  let indexContent = `# WhatsFresh Components from SQL Directives\n\n`;
  
  for (const file of jsonFiles) {
    const entityName = path.basename(file, '.json');
    console.log(`Generating preview for ${entityName}...`);
    
    try {
      // Load the optimized config
      const configPath = path.join(optimizedDir, file);
      const configData = await fsPromises.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Try to load matching sample data
      let sampleData = [];
      const sampleFileName = entityName + '.json';
      const samplePath = path.join(samplesDir, sampleFileName);
      
      if (fs.existsSync(samplePath)) {
        try {
          const rawSample = await fsPromises.readFile(samplePath, 'utf8');
          sampleData = JSON.parse(rawSample).slice(0, 3);
          console.log(`Loaded ${sampleData.length} sample records`);
        } catch (sampleErr) {
          console.warn(`Error loading sample data: ${sampleErr.message}`);
        }
      }
      
      // Generate HTML using optimized config
      const htmlContent = generateHtmlPreview(config, sampleData);
      await fsPromises.writeFile(path.join(docsDir, `${entityName}.html`), htmlContent);
      
      indexContent += `- [${entityName}](./visual/${entityName}.html)\n`;
    } catch (err) {
      console.error(`Error processing ${entityName}: ${err.message}`);
    }
  }
  
  await fsPromises.writeFile(path.resolve(__dirname, '../../docs/visual-previews.md'), indexContent);
  console.log('Generated visual previews at docs/visual/');
}

// Alternative - manually filter out columns by field name for extra safety
function generateHtmlPreview(config, sampleData = []) {
  const { title } = config;
  
  // Debug what we're working with
  console.log(`Processing ${config.id}:`);
  console.log(`- Table columns defined: ${config.tableConfig.columns.map(c => c.field).join(', ')}`);
  
  // Create a Set of allowed field names (for O(1) lookups)
  const allowedTableFields = new Set(config.tableConfig.columns.map(col => col.field));
  
  // STRICTLY filter sample data to only include allowed fields
  const filteredSampleData = sampleData.map(record => {
    const newRecord = {};
    // Only copy fields that are explicitly in the tableConfig.columns
    config.tableConfig.columns.forEach(col => {
      // Use column field names as the only source of truth
      newRecord[col.field] = record[col.field] !== undefined ? record[col.field] : '';
    });
    return newRecord;
  });
  
  console.log(`- Sample data fields after filtering: ${filteredSampleData.length > 0 ? 
    Object.keys(filteredSampleData[0]).join(', ') : 'no sample data'}`);
  
  // Generate HTML using strictly the columns from config and filtered data
  const tableColumns = [...config.tableConfig.columns]; // Create a copy to ensure we don't modify the original
  const tableHtml = generateTableHtml(title, tableColumns, filteredSampleData);
  
  // Form fields from optimized config
  const formGroups = config.formConfig.groups;
  const formHtml = generateFormGroupsHtml(config.title, formGroups, filteredSampleData.length > 0 ? filteredSampleData[0] : null);
  
  // Generate the template using strictly these columns
  return `<!DOCTYPE html>
  <html>
  <head>
    <title>${title} Preview</title>
    <style>
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
      .form-group { margin-bottom: 25px; border-bottom: 1px dashed #eee; padding-bottom: 15px; }
      .group-header { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; color: #555; background: #f5f5f5; padding: 5px; }
      .form-row { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 15px; }
      .form-field { flex: 1; min-width: 200px; }
      label { display: block; font-weight: bold; margin-bottom: 8px; color: #555; }
      .field-preview { padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
      .multiline-field { height: 80px; }
      .select-field { position: relative; }
      .select-field:after { content: "▼"; position: absolute; right: 10px; top: 10px; color: #777; }
      .checkbox-field { display: flex; align-items: center; }
      .checkbox-preview { width: 20px; height: 20px; border: 1px solid #999; border-radius: 3px; margin-right: 10px; }
      .number-field { color: #1565c0; }
      .required-marker { color: #e53935; margin-left: 3px; }
      .field-type { font-size: 0.8em; color: #777; margin-left: 5px; }
    </style>
    <script>
      function toggleView(view) {
        const tableView = document.getElementById('table-section');
        const formView = document.getElementById('form-section');
        const tableBtns = document.querySelectorAll('.table-btn');
        const formBtns = document.querySelectorAll('.form-btn');
        
        if (view === 'table') {
          tableView.style.display = 'block';
          formView.style.display = 'none';
          tableBtns.forEach(btn => btn.classList.add('active'));
          formBtns.forEach(btn => btn.classList.remove('active'));
        } else if (view === 'form') {
          tableView.style.display = 'none';
          formView.style.display = 'block';
          tableBtns.forEach(btn => btn.classList.remove('active'));
          formBtns.forEach(btn => btn.classList.add('active'));
        } else {
          tableView.style.display = 'block';
          formView.style.display = 'block';
          tableBtns.forEach(btn => btn.classList.remove('active'));
          formBtns.forEach(btn => btn.classList.remove('active'));
        }
      }
    </script>
  </head>
  <body>
    <h1>${title} Component Preview</h1>
    <p><em>Visual preview based on SQL directives - Generated on ${new Date().toLocaleDateString()}</em></p>
    
    <div class="controls">
      <button class="toggle-btn table-btn" onclick="toggleView('table')">Table View Only</button>
      <button class="toggle-btn form-btn" onclick="toggleView('form')">Form View Only</button>
      <button class="toggle-btn" onclick="toggleView('both')">Show Both</button>
    </div>
    
    <div class="directive-list">
      <h3>Columns in Optimized Config</h3>
      <ul>
        ${config.tableConfig.columns.map(col => `<li>${col.field}: ${col.label}</li>`).join('')}
      </ul>
    </div>
    
    <div class="preview-container">
      <div id="table-section" class="preview-section">
        <h2>Table View</h2>${tableHtml}
      </div>
      <div id="form-section" class="preview-section">
        <h2>Form View</h2>${formHtml}
      </div>
    </div>
  </body>
  </html>`;
}

// Ensure table HTML generation ONLY uses the provided columns
function generateTableHtml(title, columns, sampleData = []) {
  if (!columns || columns.length === 0) {
    return `<p><em>No visible columns in table view</em></p>`;
  }
  
  // Debug information
  console.log(`Rendering table for ${title} with ${columns.length} columns:`);
  console.log(columns.map(c => c.field).join(', '));
  
  // Create table header strictly using only the optimized columns
  let tableHtml = `
    <table>
      <thead>
        <tr>
          ${columns.map(col => `<th>${formatColumnName(col.label || col.field)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;
  
  // Sample data rendering - STRICTLY use only fields defined in columns
  if (sampleData.length > 0) {
    sampleData.forEach(record => {
      tableHtml += `<tr>`;
      // Important: Only iterate through the defined columns, not all fields in the record
      columns.forEach(col => {
        const value = record[col.field] !== undefined ? record[col.field] : '';
        tableHtml += `<td>${value}</td>`;
      });
      tableHtml += `</tr>`;
    });
  } else {
    // Generate sample data for exactly the columns specified
    for (let i = 1; i <= 3; i++) {
      tableHtml += `<tr>`;
      columns.forEach(col => {
        const sampleValue = getSampleData(col, i);
        tableHtml += `<td>${sampleValue}</td>`;
      });
      tableHtml += `</tr>`;
    }
  }
  
  tableHtml += `</tbody></table>`;
  return tableHtml;
}

function generateFormGroupsHtml(title, formGroups, sampleRecord = null) {
  if (formGroups.length === 0) {
    return `<p><em>No visible fields in form view</em></p>`;
  }
  
  let formHtml = '<div class="form-container">';
  
  // Iterate through each group
  formGroups.forEach(group => {
    formHtml += `<div class="form-group">`;
    
    // Only show group label if there's more than one group
    if (formGroups.length > 1) {
      formHtml += `<div class="group-header">Group ${group.id}</div>`;
    }
    
    // Create form fields for this group
    formHtml += `<div class="form-row">`;
    
    group.fields.forEach(field => {
      // Add a red asterisk for required fields
      const requiredMarker = field.req 
        ? '<span class="required-marker">*</span>' 
        : '';
      
      // Continue showing field type in brackets
      const fieldType = `<span class="field-type">[${field.type || 'text'}]</span>`;
      
      formHtml += `
        <div class="form-field">
          <label>${field.label}${requiredMarker} ${fieldType}</label>
          ${generateFieldPreview(field, sampleRecord)}
        </div>`;
    });
    
    formHtml += `</div></div>`;
  });
  
  formHtml += '</div>';
  return formHtml;
}

function generateDirectiveList(columns) {
  let html = '<div class="directive-list">';
  
  // Extract unique directives used
  const directives = new Set();
  Object.values(columns).forEach(col => {
    // Extract directive types from column properties
    if (col.req) directives.add('req');
    if (col.type) directives.add(`type:${col.type}`);
    if (col.label && col.label !== col.field) directives.add('label');
    if (col.grp) directives.add('grp');
    if (col.tableHide) directives.add('tableHide');
    if (col.formHide) directives.add('formHide');
    // And so on for other directives
  });
  
  // Convert to HTML list
  html += '<ul>';
  directives.forEach(dir => {
    html += `<li class="directive">${dir}</li>`;
  });
  html += '</ul></div>';
  
  return html;
}

// Update the generateTableHtml function

function generateTableHtml(title, columns, sampleData = []) {
  if (!columns || columns.length === 0) {
    return `<p><em>No visible columns in table view</em></p>`;
  }
  
  // Debug information
  console.log(`Rendering table for ${title} with ${columns.length} columns:`);
  console.log(columns.map(c => c.field).join(', '));
  
  // Create table header strictly using only the optimized columns
  let tableHtml = `
    <table>
      <thead>
        <tr>
          ${columns.map(col => `<th>${formatColumnName(col.label || col.field)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;
  
  // Sample data rendering - STRICTLY use only fields defined in columns
  if (sampleData.length > 0) {
    sampleData.forEach(record => {
      tableHtml += `<tr>`;
      // Important: Only iterate through the defined columns, not all fields in the record
      columns.forEach(col => {
        const value = record[col.field] !== undefined ? record[col.field] : '';
        tableHtml += `<td>${value}</td>`;
      });
      tableHtml += `</tr>`;
    });
  } else {
    // Generate sample data for exactly the columns specified
    for (let i = 1; i <= 3; i++) {
      tableHtml += `<tr>`;
      columns.forEach(col => {
        const sampleValue = getSampleData(col, i);
        tableHtml += `<td>${sampleValue}</td>`;
      });
      tableHtml += `</tr>`;
    }
  }
  
  tableHtml += `</tbody></table>`;
  return tableHtml;
}

function generateFieldPreview(field, sampleRecord) {
  // Use real sample data if available
  if (sampleRecord && field.field in sampleRecord) {
    const value = sampleRecord[field.field];
    // Use field.type instead of field.displayType
    const type = field.type || 'text';
    
    switch (type) {
      case 'multiLine':
        return `<div class="field-preview multiline-field">${value || ''}</div>`;
      case 'select':
        return `<div class="field-preview select-field">${value || ''}</div>`;
      case 'number':
        return `<div class="field-preview number-field">${value || 0}</div>`;
      case 'boolean':
        return `<div class="checkbox-field">
          <div class="checkbox-preview">${value ? '✓' : ''}</div>
          <span>${value ? 'Yes' : 'No'}</span>
        </div>`;
      default:
        return `<div class="field-preview">${value || ''}</div>`;
    }
  }
  
  // Fallback to generated content
  // Use field.type instead of field.displayType here too
  const type = field.type || 'text';
  
  switch (type) {
    case 'multiLine':
      return `<div class="field-preview multiline-field">Sample multi-line text content...</div>`;
    case 'select':
      return `<div class="field-preview select-field">
        ${field.entity ? field.entity.replace('List', '') + ' Option' : 'Select option...'}
      </div>`;
    case 'number':
      return `<div class="field-preview number-field">42</div>`;
    case 'date':
      return `<div class="field-preview">2025-06-14</div>`;
    case 'boolean':
      return `<div class="checkbox-field">
        <div class="checkbox-preview"></div>
        <span>No</span>
      </div>`;
    default:
      return `<div class="field-preview">${field.field} sample value</div>`;
  }
}

function getSampleData(column, rowIndex) {
  const type = column.type || 'text';
  
  switch (type) {
    case 'number':
      return rowIndex * 10 + Math.floor(Math.random() * 5);
      
    case 'date':
      return `2025-06-${10 + rowIndex}`;
      
    case 'boolean':
      return rowIndex % 2 ? 'Yes' : 'No';
      
    case 'select':
      if (column.entity) {
        return `${column.entity.replace('List', '')} ${rowIndex}`;
      }
      return `Option ${rowIndex}`;
      
    default:
      return `Sample ${column.field} ${rowIndex}`;
  }
}

function formatColumnName(name) {
  // Fix "Type I D" -> "Type ID"
  return name.replace(/\s+([A-Z])\s+([A-Z])$/, ' $1$2')
            .replace(/([A-Z])([A-Z])$/, '$1$2');
}

// Run the generator
module.exports = { generateVisualDocumentation };