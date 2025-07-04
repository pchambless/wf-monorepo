/**
 * Enhanced Widget Documentation Generator
 * Generates widget docs with usage information from directive files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use the same registry as the analyzer to avoid JSX import issues
const ANALYSIS_WIDGET_REGISTRY = {
    // CRUD Widgets
    'crudTbl': { component: 'CrudTbl', category: 'crud', description: 'CRUD table with add/edit/delete' },
    'entryForm': { component: 'EntryForm', category: 'crud', description: 'Entity entry form' },
    'entryList': { component: 'EntryList', category: 'crud', description: 'Entity list view' },

    // Select Widgets  
    'selAcct': { component: 'SelAcct', category: 'select', description: 'Account selector' },
    'selBtch': { component: 'SelBtch', category: 'select', description: 'Batch selector' },
    'selBrnd': { component: 'SelBrnd', category: 'select', description: 'Brand selector' },
    'selIngr': { component: 'SelIngr', category: 'select', description: 'Ingredient selector' },
    'selProd': { component: 'SelProd', category: 'select', description: 'Product selector' },
    'selMeas': { component: 'SelMeas', category: 'select', description: 'Measurement selector' },
    'selVndr': { component: 'SelVndr', category: 'select', description: 'Vendor selector' },
    'selWrkr': { component: 'SelWrkr', category: 'select', description: 'Worker selector' },
    'selRcpe': { component: 'SelRcpe', category: 'select', description: 'Recipe selector' },

    // Recent Item Widgets
    'rcntAcct': { component: 'RcntAcct', category: 'recent', description: 'Recent accounts' },
    'rcntBtch': { component: 'RcntBtch', category: 'recent', description: 'Recent batches' },
    'rcntBrnd': { component: 'RcntBrnd', category: 'recent', description: 'Recent brands' },
    'rcntIngr': { component: 'RcntIngr', category: 'recent', description: 'Recent ingredients' },
    'rcntProd': { component: 'RcntProd', category: 'recent', description: 'Recent products' },
    'rcntIngrBtch': { component: 'RcntIngrBtch', category: 'recent', description: 'Recent ingredient batches' },
    'rcntProdBtch': { component: 'RcntProdBtch', category: 'recent', description: 'Recent product batches' },

    // Display Widgets
    'dispAcct': { component: 'DispAcct', category: 'display', description: 'Account display' },
    'dispBtch': { component: 'DispBtch', category: 'display', description: 'Batch display' },
    'dispBrnd': { component: 'DispBrnd', category: 'display', description: 'Brand display' },
    'dispIngr': { component: 'DispIngr', category: 'display', description: 'Ingredient display' },
    'dispProd': { component: 'DispProd', category: 'display', description: 'Product display' },
    'dispMeas': { component: 'DispMeas', category: 'display', description: 'Measurement display' },
    'dispVndr': { component: 'DispVndr', category: 'display', description: 'Vendor display' },
    'dispWrkr': { component: 'DispWrkr', category: 'display', description: 'Worker display' },
    'dispRcpe': { component: 'DispRcpe', category: 'display', description: 'Recipe display' },

    // Form Widgets
    'formAcct': { component: 'FormAcct', category: 'form', description: 'Account form' },
    'formBtch': { component: 'FormBtch', category: 'form', description: 'Batch form' },
    'formBrnd': { component: 'FormBrnd', category: 'form', description: 'Brand form' },
    'formIngr': { component: 'FormIngr', category: 'form', description: 'Ingredient form' },
    'formProd': { component: 'FormProd', category: 'form', description: 'Product form' },
    'formMeas': { component: 'FormMeas', category: 'form', description: 'Measurement form' },
    'formVndr': { component: 'FormVndr', category: 'form', description: 'Vendor form' },
    'formWrkr': { component: 'FormWrkr', category: 'form', description: 'Worker form' },
    'formRcpe': { component: 'FormRcpe', category: 'form', description: 'Recipe form' }
};

/**
 * Read directive files and extract widget usage information
 */
async function getWidgetUsageFromDirectives() {
    const rootPath = path.resolve(__dirname, '../../../../..');
    const directivePaths = [
        path.join(rootPath, 'packages/devtools/src/automation/page/directives'),
    ];

    const widgetUsage = {};

    for (const dirPath of directivePaths) {
        try {
            const files = await fs.readdir(dirPath);

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(dirPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');

                    try {
                        const data = JSON.parse(content);
                        const viewName = data.viewName || file.replace('.json', '');

                        if (data.columns) {
                            Object.entries(data.columns).forEach(([fieldName, fieldData]) => {
                                if (fieldData.directives && fieldData.directives.widget) {
                                    const widgetName = fieldData.directives.widget;

                                    if (!widgetUsage[widgetName]) {
                                        widgetUsage[widgetName] = [];
                                    }

                                    widgetUsage[widgetName].push({
                                        view: viewName,
                                        field: fieldName,
                                        label: fieldData.directives.label || fieldName,
                                        file: `directives/${file}`,
                                        type: 'directive'
                                    });
                                }
                            });
                        }
                    } catch (parseError) {
                        console.warn(`Could not parse ${file}:`, parseError.message);
                    }
                }
            }
        } catch (error) {
            console.warn(`Could not read directive directory ${dirPath}:`, error.message);
        }
    }

    return widgetUsage;
}

/**
 * Generate enhanced widget documentation with usage information
 */
export async function generateEnhancedWidgetDocs() {
    console.log('🚀 Generating enhanced widget documentation with directive usage analysis...');

    // Get widget usage from directive files
    const widgetUsage = await getWidgetUsageFromDirectives();

    // Create usage map compatible with existing functions
    const widgetUsageMap = {};
    Object.keys(ANALYSIS_WIDGET_REGISTRY).forEach(widgetId => {
        widgetUsageMap[widgetId] = {
            widget: ANALYSIS_WIDGET_REGISTRY[widgetId],
            usages: widgetUsage[widgetId] || [],
            summary: generateUsageSummary(widgetUsage[widgetId] || [])
        };
    });

    // Generate main widget registry with usage info
    await generateEnhancedRegistryOverview(widgetUsageMap);

    // Generate individual widget detail pages with usage info
    await generateEnhancedWidgetDetails(widgetUsageMap);

    console.log('✅ Enhanced widget documentation generated successfully!');
}

/**
 * Generate a summary of widget usage
 */
function generateUsageSummary(usages) {
    const views = new Set();
    const apps = new Set();

    usages.forEach(usage => {
        if (usage.view) views.add(usage.view);
        if (usage.file && usage.file.includes('client')) apps.add('client');
        if (usage.file && usage.file.includes('admin')) apps.add('admin');
    });

    return {
        totalUsages: usages.length,
        apps: Array.from(apps),
        views: Array.from(views),
        fields: usages.map(u => u.field).filter(Boolean)
    };
}

/**
 * Generate enhanced registry overview with usage information
 */
async function generateEnhancedRegistryOverview(widgetUsageMap) {
    const outputPath = path.resolve(__dirname, '../../../generated/widgets/index.html');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Registry with Usage - WhatsFresh Documentation</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <nav class="nav">
    <div class="nav-content">
      <h1>WhatsFresh Documentation</h1>
      <div class="nav-links">
        <a href="../index.html">Home</a>
        <a href="../overview/index.html">Overview</a>
        <a href="../widgets/index.html" class="active">Widgets</a>
        <a href="../pages/index.html">Pages</a>
        <a href="../events/index.html">Events</a>
      </div>
    </div>
  </nav>
  
  <div class="container">
    <div class="content">
      <h1>Widget Registry with Usage Analysis</h1>
      <p>The WhatsFresh widget system provides ${Object.keys(ANALYSIS_WIDGET_REGISTRY).length} reusable UI components. Usage analysis shows actual implementation across the codebase.</p>
      
      <div class="widget-categories">
        ${generateWidgetCategoryCards(widgetUsageMap)}
      </div>
    </div>
  </div>
  
  <style>
    .usage-stats { 
      background: #f8f9fa; 
      padding: 0.5rem; 
      border-radius: 4px; 
      font-size: 0.85rem; 
      margin: 0.5rem 0;
    }
    .usage-count { color: #28a745; font-weight: bold; }
    .no-usage { color: #dc3545; }
    .usage-apps { color: #007bff; }
    .widget-card { position: relative; }
    .usage-indicator {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .used { background: #d4edda; color: #155724; }
    .unused { background: #f8d7da; color: #721c24; }
  </style>
  
  <footer style="padding: 2rem; text-align: center; color: #6c757d;">
    <p>Generated by WhatsFresh DevTools • ${new Date().toISOString().split('T')[0]} • Usage Analysis Included</p>
  </footer>
</body>
</html>`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html);
    console.log(`✅ Enhanced widget registry generated: ${outputPath}`);
}

/**
 * Generate widget category cards with usage information
 */
function generateWidgetCategoryCards(widgetUsageMap) {
    const categories = {};

    // Group widgets by type
    Object.entries(widgetUsageMap).forEach(([widgetId, data]) => {
        const type = data.widget.type || 'other';
        if (!categories[type]) categories[type] = [];
        categories[type].push({ widgetId, ...data });
    });

    return Object.entries(categories).map(([type, widgets]) => {
        const widgetCards = widgets.map(({ widgetId, widget, summary }) => {
            const usageCount = summary.totalUsages;
            const isUsed = usageCount > 0;

            return `
        <div class="widget-card">
          <div class="usage-indicator ${isUsed ? 'used' : 'unused'}">
            ${isUsed ? `${usageCount} uses` : 'Unused'}
          </div>
          <h3>${widgetId}</h3>
          <p><strong>Type:</strong> ${widget.type}</p>
          <p><strong>Size:</strong> ${widget.defaultSize}</p>
          <p><strong>Component:</strong> ${widget.component}</p>
          <p class="description">${widget.description}</p>
          
          <div class="usage-stats">
            ${isUsed ? `
              <div class="usage-count">🎯 ${usageCount} usage${usageCount !== 1 ? 's' : ''} found</div>
              <div class="usage-apps">📱 Apps: ${summary.apps.join(', ') || 'None'}</div>
              <div>📄 Pages: ${summary.pageUsages} • 🧩 Components: ${summary.componentUsages}</div>
            ` : `
              <div class="no-usage">⚠️ No usage found in codebase</div>
            `}
          </div>
          
          <div class="widget-actions">
            <a href="./detail/${widgetId}.html" class="detail-link">View Details & Usage</a>
          </div>
        </div>
      `;
        }).join('\\n');

        return `
      <div class="category-section">
        <h2>${type.toUpperCase()} Widgets (${widgets.length})</h2>
        <div class="widget-grid">
          ${widgetCards}
        </div>
      </div>
    `;
    }).join('\\n');
}

/**
 * Generate enhanced individual widget detail pages
 */
async function generateEnhancedWidgetDetails(widgetUsageMap) {
    const detailsDir = path.resolve(__dirname, '../../../generated/widgets/detail');
    await fs.mkdir(detailsDir, { recursive: true });

    for (const [widgetId, data] of Object.entries(widgetUsageMap)) {
        const { widget, usages, summary } = data;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${widgetId} Widget - Usage Details</title>
  <link rel="stylesheet" href="../../styles.css">
</head>
<body>
  <nav class="nav">
    <div class="nav-content">
      <h1>WhatsFresh Documentation</h1>
      <div class="nav-links">
        <a href="../../widgets/index.html">← Back to Widgets</a>
      </div>
    </div>
  </nav>
  
  <div class="container">
    <div class="content">
      <h1>${widgetId} Widget</h1>
      
      <div class="widget-detail-header">
        <div class="widget-meta">
          <span class="widget-type">${widget.type}</span>
          <span class="widget-size">${widget.defaultSize}</span>
          <span class="widget-usage ${summary.totalUsages > 0 ? 'used' : 'unused'}">
            ${summary.totalUsages} usage${summary.totalUsages !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div class="detail-sections">
        <div class="card">
          <h2>Description</h2>
          <p>${widget.description}</p>
        </div>
        
        <div class="card">
          <h2>Widget Properties</h2>
          <table>
            <tr><td><strong>ID:</strong></td><td>${widgetId}</td></tr>
            <tr><td><strong>Component:</strong></td><td>${widget.component}</td></tr>
            <tr><td><strong>Type:</strong></td><td>${widget.type}</td></tr>
            <tr><td><strong>Default Size:</strong></td><td>${widget.defaultSize}</td></tr>
            <tr><td><strong>Data Source:</strong></td><td>${widget.dataSource || 'None'}</td></tr>
            <tr><td><strong>Configurable:</strong></td><td>${widget.configurable ? 'Yes' : 'No'}</td></tr>
          </table>
        </div>
        
        ${generateUsageSection(widgetId, usages, summary)}
        
        <div class="card">
          <h2>Usage Example</h2>
          <pre><code>import { ${widget.component} } from '@whatsfresh/shared-ui';

// Basic usage
&lt;${widget.component} 
  ${widget.dataSource ? `data={${widget.dataSource}}` : ''}
  size="${widget.defaultSize}"
/&gt;</code></pre>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    .usage-section { margin: 1.5rem 0; }
    .usage-summary { 
      background: #e3f2fd; 
      padding: 1rem; 
      border-radius: 8px; 
      margin-bottom: 1rem; 
    }
    .usage-list { max-height: 400px; overflow-y: auto; }
    .usage-item { 
      padding: 0.75rem; 
      margin: 0.5rem 0; 
      background: #f8f9fa; 
      border-left: 4px solid #007bff; 
      border-radius: 4px; 
    }
    .usage-file { font-weight: bold; color: #495057; }
    .usage-content { 
      font-family: monospace; 
      font-size: 0.85rem; 
      color: #6c757d; 
      margin: 0.25rem 0; 
    }
    .usage-meta { font-size: 0.8rem; color: #868e96; }
    .widget-usage.used { background: #d4edda; color: #155724; }
    .widget-usage.unused { background: #f8d7da; color: #721c24; }
    .no-usage-message { 
      text-align: center; 
      padding: 2rem; 
      color: #6c757d; 
      background: #f8f9fa; 
      border-radius: 8px; 
    }
  </style>
</body>
</html>`;

        const outputPath = path.join(detailsDir, `${widgetId}.html`);
        await fs.writeFile(outputPath, html);
    }

    console.log(`✅ Generated ${Object.keys(widgetUsageMap).length} enhanced widget detail pages`);
}

/**
 * Generate the usage section for a widget detail page
 */
function generateUsageSection(widgetId, usages, summary) {
    if (summary.totalUsages === 0) {
        return `
      <div class="card">
        <h2>🔍 Usage Analysis</h2>
        <div class="no-usage-message">
          <h3>⚠️ No Usage Found</h3>
          <p>This widget was not found in use anywhere in the codebase.</p>
          <p>This could mean:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>The widget is newly created and not yet implemented</li>
            <li>The widget is deprecated and should be removed</li>
            <li>The widget is used in external files not scanned</li>
          </ul>
        </div>
      </div>
    `;
    }

    const usagesByApp = usages.reduce((acc, usage) => {
        if (!acc[usage.app]) acc[usage.app] = [];
        acc[usage.app].push(usage);
        return acc;
    }, {});

    return `
    <div class="card">
      <h2>🎯 Usage Analysis</h2>
      <div class="usage-summary">
        <strong>Summary:</strong> Found <strong>${summary.totalUsages}</strong> usage${summary.totalUsages !== 1 ? 's' : ''} 
        across <strong>${summary.apps.length}</strong> app${summary.apps.length !== 1 ? 's' : ''}<br>
        <strong>Applications:</strong> ${summary.apps.join(', ')}<br>
        <strong>Pages:</strong> ${summary.pageUsages} • <strong>Components:</strong> ${summary.componentUsages}
      </div>
      
      <h3>Usage Locations</h3>
      <div class="usage-list">
        ${Object.entries(usagesByApp).map(([app, appUsages]) => `
          <h4>${app.toUpperCase()} App (${appUsages.length} usage${appUsages.length !== 1 ? 's' : ''})</h4>
          ${appUsages.map(usage => `
            <div class="usage-item">
              <div class="usage-file">📁 ${usage.file}</div>
              <div class="usage-content">${escapeHtml(usage.content)}</div>
              <div class="usage-meta">Line ${usage.line} • ${usage.type} • Component: ${usage.component}</div>
            </div>
          `).join('')}
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
