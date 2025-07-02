import getCSS from './getCss.js';
import genTableHtml from './genTableHtml.js';
import genFormHtml from './genFormHtml.js';
import genDmlHtml from './genDmlHtml.js';


export function genEntityHtml(entityName, pageMap, sampleData) {
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
  <div class="back-link" style="margin-bottom: 1rem;">
    <a href="./index.html" style="text-decoration: none; font-size: 0.95rem;">&larr; Back to Pages</a>
  </div>

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
      ${genTableHtml(pageMap.tableConfig, sampleData)}
    </div>
    
    <div id="form-section" class="preview-section" style="display: none;">
      <h2>Form View</h2>
      ${genFormHtml(pageMap.formConfig, sampleData[0] || {})}
    </div>
    
    <div id="dml-section" class="preview-section" style="display: none;">
      <h2>DML Preview</h2>
      ${genDmlHtml(pageMap.systemConfig, pageMap.dmlConfig, sampleData)}
    </div>
  </div>
</body>
</html>`;
};
