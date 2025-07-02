import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WIDGET_REGISTRY, WIDGET_TYPES } from '@whatsfresh/shared-ui/src/widgets/index.js';
import { abbreviationMap } from '@whatsfresh/shared-config/src/common/abbreviationMap.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates documentation for the widget system
 */
async function generateWidgetDocumentation() {
  console.log('Generating widget documentation...');
  
  // Create docs directory if not exists
  const docsDir = path.resolve(__dirname, '../../Docs/widgets');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  try {
    // Generate widget registry overview
    await generateRegistryOverview();
    
    // Generate individual widget documentation
    await generateIndividualWidgetDocs();
    
    // Generate widget usage guide
    await generateWidgetUsageGuide();
    
    console.log('Widget documentation completed successfully');
  } catch (error) {
    console.error('Error generating widget documentation:', error);
    throw error;
  }
}

/**
 * Generate overview of the widget registry
 */
async function generateRegistryOverview() {
  // Generate HTML with more compact styling
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>WhatsFresh Widget Registry</title>
    <style>
      body { 
        font-family: system-ui, sans-serif; 
        line-height: 1.4; 
        padding: 1.5rem; 
        max-width: 1200px; 
        margin: 0 auto; 
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin: 0.5rem 0 1.5rem; 
      }
      th, td { 
        text-align: left; 
        padding: 0.5rem; 
        border: 1px solid #ddd; 
      }
      th { background: #f5f5f5; }
      .widget-group { margin-bottom: 1rem; }
      h1 { margin-bottom: 0.5rem; }
      h2 { 
        border-bottom: 1px solid #eee; 
        padding-bottom: 0.3rem; 
        margin: 1rem 0 0.5rem 0; 
      }
      p { margin: 0.5rem 0; }
      .nav { 
        margin-bottom: 15px; 
        padding: 8px; 
        background-color: #f8f8f8; 
        border-radius: 4px; 
      }
    </style>
  </head>
  <body>
    <div class="nav">
      <a href="../index.html">Home</a> | 
      <a href="../pagePreview/index.html">Page Previews</a>
    </div>

    <h1>WhatsFresh Widget Registry</h1>
    <p>This documentation provides an overview of all registered widgets in the WhatsFresh system.</p>
    
    ${Object.entries(WIDGET_TYPES).map(([typeKey, typeValue]) => {
      const widgetsOfType = Object.entries(WIDGET_REGISTRY)
        .filter(([_, widget]) => widget.type === typeValue);
        
      if (widgetsOfType.length === 0) return '';
      
      return `<div class="widget-group">
        <h2>${typeKey} Widgets</h2>
        <table>
          <thead>
            <tr>
              <th>Widget ID</th>
              <th>Description</th>
              <th>Data Source</th>
              <th>Used In</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${widgetsOfType.map(([id, widget]) => `<tr>
              <td>${id}</td>
              <td>${widget.description}</td>
              <td>${widget.dataSource || 'N/A'}</td>
              <td>${widget.apps?.join(', ') || 'All'}</td>
              <td><a href="./${id}.html">View Details</a></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    }).join('')}
  </body>
  </html>`;

  // Write the file
  fs.writeFileSync(
    path.resolve(__dirname, '../../Docs/widgets/index.html'), 
    html
  );
  
  console.log('Generated widget registry overview');
}

/**
 * Generate docs for individual widgets
 */
async function generateIndividualWidgetDocs() {
  // Implementation will go here
  console.log('Generating individual widget documentation...');
  
  // Create a doc file for each widget
  for (const [id, widget] of Object.entries(WIDGET_REGISTRY)) {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>${widget.id} Widget - WhatsFresh</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { text-align: left; padding: 0.5rem; border: 1px solid #ddd; }
        th { background: #f5f5f5; width: 30%; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; }
        code { font-family: monospace; }
        .back { margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="back"><a href="./index.html">← Back to Widget Registry</a></div>
      <h1>${widget.id} Widget</h1>
      <p>${widget.description}</p>
      
      <h2>Properties</h2>
      <table>
        <tr><th>ID</th><td>${widget.id}</td></tr>
        <tr><th>Component</th><td>${widget.component}</td></tr>
        <tr><th>Type</th><td>${widget.type}</td></tr>
        <tr><th>Data Source</th><td>${widget.dataSource || 'None'}</td></tr>
        <tr><th>Default Size</th><td>${widget.defaultSize}</td></tr>
        <tr><th>Used In</th><td>${widget.apps?.join(', ') || 'All'}</td></tr>
      </table>
      
      <h2>Usage Example</h2>
      <pre><code>import { ${widget.component} } from '@whatsfresh/shared-ui';
import { useAccountStore } from '../stores/accountStore';

function MyComponent() {
  const accountStore = useAccountStore();
  
  // Basic usage
  return &lt;${widget.component} /&gt;;
  
  // With store data
  return &lt;${widget.component}
    ${widget.dataSource ? `data={accountStore.${widget.dataSource}}` : ''}
    onChange={handleChange}
  /&gt;;
}</code></pre>
    </body>
    </html>`;
    
    fs.writeFileSync(
      path.resolve(__dirname, `../../Docs/widgets/${id}.html`), 
      html
    );
  }
  
  console.log(`Generated individual documentation for ${Object.keys(WIDGET_REGISTRY).length} widgets`);
}

/**
 * Generate usage guide for widgets
 */
async function generateWidgetUsageGuide() {
  console.log('Generating widget usage guide...');
  
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>Widget Usage Guide - WhatsFresh</title>
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
      pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; }
      code { font-family: monospace; }
      .nav { margin-bottom: 20px; padding: 10px; background-color: #f8f8f8; border-radius: 5px; }
      h2 { border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    </style>
  </head>
  <body>
    <div class="nav">
      <a href="../index.html">Home</a> | 
      <a href="./index.html">Widget Registry</a>
    </div>

    <h1>Widget Usage Guide</h1>
    <p>This guide explains how to use the WhatsFresh widget system in your applications.</p>
    
    <h2>Basic Widget Usage</h2>
    <p>To use a widget in your component:</p>
    <pre><code>import { SelVndr } from '@whatsfresh/shared-ui';

function MyComponent() {
  const handleVendorChange = (newVendorId) => {
    console.log('Selected vendor:', newVendorId);
  };
  
  return (
    &lt;SelVndr 
      onChange={handleVendorChange}
      required={true}
    /&gt;
  );
}</code></pre>
  </body>
  </html>`;

  fs.writeFileSync(
    path.resolve(__dirname, '../../Docs/widgets/usage-guide.html'), 
    html
  );
  
  console.log('Generated widget usage guide');
}

// Execute if run directly
generateWidgetDocumentation().catch(err => {
  console.error(err);
  process.exit(1);
});

// In ES Modules, we use export instead of module.exports
export default generateWidgetDocumentation;