// HTMX page rendering route

import express from 'express';
import loadRenderRegistry from '../loaders/renderRegistry.js';
import db from '../utils/dbManager.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Only need render registry - everything else comes from pageStructure
let renderRegistry;
async function ensureLoaded() {
  if (!renderRegistry) {
    renderRegistry = await loadRenderRegistry();
    logger.debug('[htmxRoutes.js] renderRegistry loaded');
  }
}

// ===== API ROUTES FIRST (before catch-all routes) =====

// Simple API endpoint for ingredient types data
router.get('/api/simple-ingredient-types', async (req, res) => {
  try {
    logger.debug('[htmxRoutes.js] Loading simple ingredient types data');
    
    // Simple query - no complex stored procedures
    const [rows] = await db.pool.query(`
      SELECT id, name, description, account_id
      FROM whatsfresh.ingredient_types
      WHERE account_id = 1
      ORDER BY name
    `);

    // Return simple HTML fragment (not JSON!)
    const html = rows.map(row => `
      <tr>
        <td>${row.id}</td>
        <td>${row.name || 'Unnamed'}</td>
        <td>${row.description || 'No description'}</td>
        <td>
          <button hx-get="/api/simple-ingredient-types/${row.id}/edit" 
                  hx-target="#modal-container">
            Edit
          </button>
          <button hx-delete="/api/simple-ingredient-types/${row.id}"
                  hx-target="closest tr"
                  hx-confirm="Delete this ingredient type?">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    res.send(html || '<tr><td colspan="4">No ingredient types found</td></tr>');
    
  } catch (error) {
    logger.error('[htmxRoutes.js] Error loading simple data:', error);
    res.send('<tr><td colspan="4">Error loading data</td></tr>');
  }
});

// ===== PAGE ROUTES (after API routes) =====

// Render function for pageStructure components
function renderComponent(component) {
  const compositeName = component.css_style === 'form' ? 'Form' : 
                       component.css_style === 'grid' ? 'Grid' :
                       component.css_style === 'button' ? 'Button' :
                       component.css_style === 'select' ? 'Select' :
                       component.css_style === 'container' ? 'Container' :
                       component.css_style;

  const renderer = renderRegistry[compositeName];
  if (!renderer) {
    logger.warn(`[htmxRoutes.js] Renderer not found: ${compositeName} (css_style: ${component.css_style})`);
    return `<!-- Renderer not found: ${compositeName} -->`;
  }

  logger.debug(`[htmxRoutes.js] Rendering component: ${component.id} (${compositeName})`);
  return renderer.fn(component);
}

// Render component tree from sp_pageStructure output
function renderComponentTree(components, level = 0, pageName = null, parentId = null) {
  return components
    .filter(c => c.level === level && (parentId === null || c.parent_id === parentId))
    .map(component => {
      // Find children of THIS component specifically
      const children = renderComponentTree(components, level + 1, pageName, component.pageComponent_id);
      
      // Add children to component if they exist
      if (children) {
        component.children = children;
      }

      return renderComponent(component);
    })
    .join('\n');
}

// GET /:appName/:pageName - Database-driven routing via vw_routePath
router.get('/:appName/:pageName', async (req, res, next) => {
  try {
    await ensureLoaded();

    const { appName, pageName } = req.params;

    // Skip /controller/* routes - let them fall through to controller router
    if (appName === 'controller') {
      return next();
    }

    const routePath = `/${appName}/${pageName}`;
    logger.http(`[htmxRoutes.js] GET ${routePath}`);

    // Lookup page via vw_routePath (pattern from _old_eventSQL id=77)
    const [[route]] = await db.pool.query(`
      SELECT pageID, appID, appName, pageName, routePath
      FROM api_wf.vw_routePath
      WHERE routePath = ?
    `, [routePath]);

    if (!route) {
      logger.warn(`[htmxRoutes.js] Route not found: ${routePath}`);
      return res.status(404).send('Page not found');
    }

    logger.debug(`[htmxRoutes.js] Found pageID=${route.pageID} for ${routePath}`);


    // Get app-level shell configs
    const [[app]] = await db.pool.query(
      `SELECT appbarConfig, sidebarConfig, footerConfig FROM api_wf.app WHERE id = ?`,
      [route.appID]
    );

    // Get page structure via sp_pageStructure
    const [results] = await db.pool.query('CALL api_wf.sp_pageStructure(?)', [route.pageID]);
    if (!results || !results[0] || !results[0][0]) {
      logger.error(`[htmxRoutes.js] sp_pageStructure returned no data for pageID=${route.pageID}`);
      return res.status(500).send('Page configuration error');
    }
    const pageData = results[0][0];
    const pageConfig = pageData.pageConfig;
    if (!pageConfig || !pageConfig.components) {
      logger.error(`[htmxRoutes.js] pageConfig invalid:`, pageData);
      return res.status(500).send('Page configuration invalid');
    }
    logger.debug(`[htmxRoutes.js] Rendering ${pageConfig.components.length} components`);

    // Render page-specific content using pageStructure
    const pageContentHTML = renderComponentTree(pageConfig.components, 0, pageName);

    // Collect unique css_styles used for CSS loading
    const usedStyles = new Set();
    if (pageConfig.components) {
      pageConfig.components.forEach(component => {
        if (component.css_style) {
          usedStyles.add(component.css_style);
        }
      });
    }

    // Generate CSS links from css_style
    const baseTheme = `<link rel="stylesheet" href="/css/theme.css">`;
    const componentCss = Array.from(usedStyles)
      .map(styleClass => `<link rel="stylesheet" href="/css/components/${styleClass}.css">`)
      .join('\n    ');
    const cssLinks = `${baseTheme}\n    ${componentCss}`;

    // Wrap in full HTML document with CSS - no shell components, just page content
    const fullHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName} - ${appName}</title>
    ${cssLinks}
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <script>
      // Minimal HTMX logging for Studio2 debugging
      document.addEventListener('htmx:beforeRequest', function(evt) {
        const method = evt.detail.requestConfig.verb.toUpperCase();
        const url = evt.detail.pathInfo.requestPath;
        console.log('HTMX Request: ' + method + ' ' + url);
        
        if (evt.detail.requestConfig.body) {
          try {
            const body = JSON.parse(evt.detail.requestConfig.body);
            if (body.workflowName) {
              console.log('Workflow: ' + body.workflowName + ' (' + (body.method || 'POST') + ')');
            }
          } catch (e) {
            console.log('Body:', evt.detail.requestConfig.body.substring(0, 100));
          }
        }
      });
      
      document.addEventListener('htmx:afterRequest', function(evt) {
        const status = evt.detail.xhr.status;
        const url = evt.detail.pathInfo.requestPath;
        const statusIcon = status === 200 ? 'SUCCESS' : 'ERROR';
        console.log('HTMX Response: ' + statusIcon + ' ' + status + ' ' + url);
        
        if (evt.detail.xhr.responseText && evt.detail.xhr.responseText.includes('<option')) {
          const optionCount = (evt.detail.xhr.responseText.match(/<option/g) || []).length;
          console.log('Response: ' + optionCount + ' options loaded');
        }
      });
      
      document.addEventListener('htmx:responseError', function(evt) {
        console.error('HTMX Error: ' + evt.detail.xhr.status + ' ' + evt.detail.pathInfo.requestPath);
      });
    </script>
  </head>
  <body>
    ${pageContentHTML}
  </body>
</html>
    `;
    res.send(fullHTML);

  } catch (error) {
    logger.error('[htmxRoutes.js] Error:', error);
    res.status(500).send('Internal server error');
  }
});

// Simple HTMX route - following best practices
router.get('/simple/:appName/:pageName', async (req, res) => {
  try {
    const { appName, pageName } = req.params;
    logger.http(`[htmxRoutes.js] Simple GET /${appName}/${pageName}`);

    // For ingrType page, return simple HTML with HTMX
    if (pageName === 'ingrType') {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ingredient Types - Simple HTMX</title>
  <script src="https://unpkg.com/htmx.org@1.9.10"></script>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f5f5f5; }
    .loading { text-align: center; padding: 20px; color: #666; }
    button { padding: 6px 12px; margin: 2px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Ingredient Types (Simple HTMX)</h1>
  <p><em>This is the simple, best-practice HTMX approach</em></p>
  
  <!-- Simple HTMX table - loads data on page load -->
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody hx-get="/api/simple-ingredient-types" 
           hx-trigger="load"
           hx-target="this">
      <tr>
        <td colspan="4" class="loading">Loading ingredient types...</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Simple modal container -->
  <div id="modal-container"></div>
</body>
</html>`;
      
      res.send(html);
      return;
    }

    res.status(404).send('Simple page not found');
    
  } catch (error) {
    logger.error('[htmxRoutes.js] Simple route error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;
