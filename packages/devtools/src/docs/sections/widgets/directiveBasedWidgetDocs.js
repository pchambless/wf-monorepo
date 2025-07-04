/**
 * Directive-Based Widget Documentation Generator
 * Generates widget docs by reading generated directive JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Widget registry based on the select widget exports
const WIDGET_REGISTRY = {
    // Select Widgets - mapped from createSelectWidget calls
    'selBrnd': { component: 'SelBrnd', entity: 'brndList', category: 'select', description: 'Brand selector' },
    'selVndr': { component: 'SelVndr', entity: 'vndrList', category: 'select', description: 'Vendor selector' },
    'selMeas': { component: 'SelMeas', entity: 'measList', category: 'select', description: 'Measurement selector' },
    'selProd': { component: 'SelProd', entity: 'prodList', category: 'select', description: 'Product selector' },
    'selProdType': { component: 'SelProdType', entity: 'prodTypeList', category: 'select', description: 'Product type selector' },
    'selIngr': { component: 'SelIngr', entity: 'ingrList', category: 'select', description: 'Ingredient selector' },
    'selIngrType': { component: 'SelIngrType', entity: 'ingrTypeList', category: 'select', description: 'Ingredient type selector' },
    'selWrkr': { component: 'SelWrkr', entity: 'wrkrList', category: 'select', description: 'Worker selector' },
    'selAcct': { component: 'SelAcct', entity: 'acctList', category: 'select', description: 'Account selector' },
    'selUserAcct': { component: 'SelUserAcct', entity: 'userAcctList', category: 'select', description: 'User account selector' },

    // CRUD Widgets
    'crudTbl': { component: 'CrudTbl', category: 'crud', description: 'CRUD table with add/edit/delete' },
    'entryForm': { component: 'EntryForm', category: 'crud', description: 'Entity entry form' },
    'entryList': { component: 'EntryList', category: 'crud', description: 'Entity list view' }
};

/**
 * Read and analyze directive files to find widget usage
 */
async function analyzeWidgetUsageFromDirectives() {
    console.log('📋 Analyzing widget usage from directive files...');

    const directivePath = path.join(__dirname, '../../../automation/page/directives');
    const widgetUsageMap = {};

    // Initialize usage map for all widgets
    Object.keys(WIDGET_REGISTRY).forEach(widgetId => {
        widgetUsageMap[widgetId] = {
            widget: WIDGET_REGISTRY[widgetId],
            usages: [],
            summary: {
                totalUsages: 0,
                views: [],
                fields: []
            }
        };
    });

    try {
        const files = await fs.readdir(directivePath);

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const filePath = path.join(directivePath, file);
            const viewName = path.basename(file, '.json');

            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);

                if (data.columns) {
                    Object.entries(data.columns).forEach(([fieldName, fieldData]) => {
                        if (fieldData.directives && fieldData.directives.widget) {
                            const widgetId = fieldData.directives.widget;

                            if (widgetUsageMap[widgetId]) {
                                widgetUsageMap[widgetId].usages.push({
                                    view: viewName,
                                    field: fieldName,
                                    directives: fieldData.directives,
                                    file: `directives/${file}`
                                });

                                widgetUsageMap[widgetId].summary.totalUsages++;
                                if (!widgetUsageMap[widgetId].summary.views.includes(viewName)) {
                                    widgetUsageMap[widgetId].summary.views.push(viewName);
                                }
                                widgetUsageMap[widgetId].summary.fields.push(`${viewName}.${fieldName}`);
                            }
                        }
                    });
                }
            } catch (error) {
                console.warn(`Could not read directive file ${file}:`, error.message);
            }
        }
    } catch (error) {
        console.warn(`Could not read directive directory:`, error.message);
    }

    // Sort views and fields for consistent output
    Object.values(widgetUsageMap).forEach(widget => {
        widget.summary.views.sort();
        widget.summary.fields.sort();
    });

    console.log(`✅ Analyzed ${Object.values(widgetUsageMap).reduce((sum, w) => sum + w.summary.totalUsages, 0)} widget usages`);

    return widgetUsageMap;
}

/**
 * Generate HTML documentation for all widgets with usage information
 */
export async function generateDirectiveBasedWidgetDocs() {
    console.log('🚀 Generating widget documentation from directive files...');

    const widgetUsageMap = await analyzeWidgetUsageFromDirectives();

    // Create output directory
    const outputDir = path.join(__dirname, '../../../docs/generated/widgets');
    await fs.mkdir(outputDir, { recursive: true });

    // Generate main widget registry page
    await generateWidgetRegistryPage(widgetUsageMap, outputDir);

    // Generate individual widget detail pages
    await generateIndividualWidgetPages(widgetUsageMap, outputDir);

    console.log('✅ Widget documentation generated successfully!');
}

/**
 * Generate the main widget registry overview page
 */
async function generateWidgetRegistryPage(widgetUsageMap, outputDir) {
    const widgets = Object.values(widgetUsageMap)
        .filter(w => w.summary.totalUsages > 0)
        .sort((a, b) => b.summary.totalUsages - a.summary.totalUsages);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Registry - WhatsFresh Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f8f9fa; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .widget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .widget-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .widget-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #2c3e50; }
    .widget-description { color: #6c757d; margin-bottom: 1rem; }
    .usage-stats { background: #e3f2fd; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
    .usage-count { font-weight: bold; color: #1976d2; }
    .views-list { margin-top: 0.5rem; }
    .view-tag { background: #f8f9fa; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; margin-right: 0.5rem; margin-bottom: 0.25rem; display: inline-block; }
    .category { text-transform: uppercase; font-size: 0.75rem; color: #6c757d; letter-spacing: 0.5px; }
    .no-usage { color: #dc3545; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Widget Registry</h1>
      <p>WhatsFresh UI components and their usage across views. Generated from directive files on ${new Date().toLocaleDateString()}.</p>
      <p><strong>${widgets.length}</strong> widgets in active use across <strong>${new Set(widgets.flatMap(w => w.summary.views)).size}</strong> views.</p>
    </div>
    
    <div class="widget-grid">
      ${widgets.map(widget => `
        <div class="widget-card">
          <div class="category">${widget.widget.category || 'utility'}</div>
          <div class="widget-title">${widget.widget.component}</div>
          <div class="widget-description">${widget.widget.description}</div>
          
          <div class="usage-stats">
            <div class="usage-count">${widget.summary.totalUsages} usage${widget.summary.totalUsages !== 1 ? 's' : ''}</div>
            <div>Used in ${widget.summary.views.length} view${widget.summary.views.length !== 1 ? 's' : ''}</div>
          </div>
          
          <div class="views-list">
            <strong>Views:</strong><br>
            ${widget.summary.views.map(view => `<span class="view-tag">${view}</span>`).join('')}
          </div>
          
          <div style="margin-top: 1rem;">
            <a href="./${widget.widget.component.toLowerCase()}.html" style="color: #1976d2; text-decoration: none;">View Details →</a>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top: 3rem; text-align: center; color: #6c757d;">
      <p>Generated by WhatsFresh DevTools • ${new Date().toISOString().split('T')[0]}</p>
    </div>
  </div>
</body>
</html>`;

    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    console.log('📄 Generated widget registry page');
}

/**
 * Generate individual detail pages for each widget
 */
async function generateIndividualWidgetPages(widgetUsageMap, outputDir) {
    for (const [widgetId, widgetData] of Object.entries(widgetUsageMap)) {
        if (widgetData.summary.totalUsages === 0) continue;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${widgetData.widget.component} - Widget Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f8f9fa; }
    .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .header { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .usage-section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    .usage-item { border-left: 3px solid #1976d2; padding-left: 1rem; margin-bottom: 1.5rem; }
    .view-name { font-weight: bold; color: #2c3e50; margin-bottom: 0.5rem; }
    .field-name { color: #1976d2; font-family: monospace; }
    .directives { background: #f8f9fa; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-family: monospace; font-size: 0.9rem; }
    .back-link { color: #1976d2; text-decoration: none; margin-bottom: 1rem; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <a href="./index.html" class="back-link">← Back to Widget Registry</a>
    
    <div class="header">
      <h1>${widgetData.widget.component}</h1>
      <p>${widgetData.widget.description}</p>
      <p><strong>Category:</strong> ${widgetData.widget.category || 'utility'}</p>
      ${widgetData.widget.entity ? `<p><strong>Entity:</strong> ${widgetData.widget.entity}</p>` : ''}
    </div>
    
    <div class="usage-section">
      <h2>Usage Summary</h2>
      <p><strong>${widgetData.summary.totalUsages}</strong> field${widgetData.summary.totalUsages !== 1 ? 's' : ''} across <strong>${widgetData.summary.views.length}</strong> view${widgetData.summary.views.length !== 1 ? 's' : ''}</p>
    </div>
    
    <div class="usage-section">
      <h2>Field Usage Details</h2>
      ${widgetData.usages.map(usage => `
        <div class="usage-item">
          <div class="view-name">${usage.view}</div>
          <div>Field: <span class="field-name">${usage.field}</span></div>
          <div class="directives">
            ${JSON.stringify(usage.directives, null, 2)}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top: 3rem; text-align: center; color: #6c757d;">
      <p>Generated by WhatsFresh DevTools • ${new Date().toISOString().split('T')[0]}</p>
    </div>
  </div>
</body>
</html>`;

        const filename = `${widgetData.widget.component.toLowerCase()}.html`;
        await fs.writeFile(path.join(outputDir, filename), html);
    }

    console.log('📄 Generated individual widget detail pages');
}
