// HTMX page rendering route

import express from 'express';
import loadRenderRegistry from '../loaders/renderRegistry.js';
import loadComposites from '../loaders/compositeLoader.js';
import loadPageConfigs from '../loaders/pageConfigLoader.js';
import loadActions from '../loaders/actionsLoader.js';
import db from '../utils/dbManager.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Loaders are async, so we cache after first load
let renderRegistry, composites, pageConfigs, actions;
async function ensureLoaded() {
  if (!renderRegistry) {
    renderRegistry = await loadRenderRegistry();
    logger.debug('[htmxRoutes.js] renderRegistry loaded');
  }
  if (!composites) {
    composites = await loadComposites();
    logger.debug('[htmxRoutes.js] composites loaded');
  }
  if (!pageConfigs) {
    pageConfigs = await loadPageConfigs();
    logger.debug('[htmxRoutes.js] pageConfigs loaded');
  }
  if (!actions) {
    actions = await loadActions();
    logger.debug('[htmxRoutes.js] actions loaded');
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

// Recursive render function
function render(compositeName, instanceProps = {}) {
  const composite = composites[compositeName];
  if (!composite) {
    logger.warn(`[htmxRoutes.js] Composite not found: ${compositeName}`);
    return `<!-- Composite not found: ${compositeName} -->`;
  }
  if (composite.category === 'base-component') {
    const renderer = renderRegistry[compositeName];
    if (!renderer) {
      logger.warn(`[htmxRoutes.js] Renderer not found: ${compositeName}`);
      return `<!-- Renderer not found: ${compositeName} -->`;
    }
    logger.debug(`[htmxRoutes.js] Rendering base-component: ${compositeName}`);
    return renderer.fn(composite, instanceProps, actions);
  }
  // Configured composite: render children
  logger.debug(`[htmxRoutes.js] Rendering composite: ${compositeName}`);
  const childHTML = (composite.components || []).map(childName => {
    const childProps = {
      ...composite.props?.[childName],
      ...instanceProps
    };
    return render(childName, childProps);
  });
  return childHTML.join('\n');
}

// Render component tree from sp_pageStructure output
function renderComponentTree(components, level = 0, pageName = null, parentId = null) {
  return components
    .filter(c => c.level === level && (parentId === null || c.parent_id === parentId))
    .map(component => {
      const compositeName = component.composite_name;
      const instanceProps = {
        ...component.props,
        id: component.id,
        title: component.title,
        triggers: component.triggers,
        pageName: pageName  // Pass pageName to all renderers
      };

      // Find children of THIS component specifically
      const children = renderComponentTree(components, level + 1, pageName, component.pageComponent_id);
      if (children) {
        instanceProps.children = children;
      }

      return render(compositeName, instanceProps);
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

    // Render shell components
    const appBarHTML = render('AppBar', app?.appbarConfig ? JSON.parse(app.appbarConfig) : {});
    const sidebarHTML = render('Sidebar', app?.sidebarConfig ? JSON.parse(app.sidebarConfig) : {});
    const footerHTML = render('Footer', app?.footerConfig ? JSON.parse(app.footerConfig) : {});

    // Render page-specific content
    const pageContentHTML = renderComponentTree(pageConfig.components, 0, pageName);

    // Collect unique composites used for CSS loading
    const usedComposites = new Set();
    usedComposites.add('AppBar');
    usedComposites.add('Sidebar');
    if (pageConfig.components) {
      pageConfig.components.forEach(component => {
        if (component.composite_name) {
          usedComposites.add(component.composite_name);
        }
      });
    }

    // Generate CSS links from composites.style column
    const cssLinks = Array.from(usedComposites)
      .map(name => composites[name]?.style)
      .filter(styleClass => styleClass)
      .map(styleClass => `<link rel="stylesheet" href="/css/components/${styleClass}.css">`)
      .join('\n    ');

    // Wrap in full HTML document with CSS
    const fullHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageName} - ${appName}</title>
    ${cssLinks}
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
  </head>
  <body>
    ${appBarHTML}
    <div class="layout">
      ${sidebarHTML}
      <main class="page-content">
        ${pageContentHTML}
      </main>
    </div>
    ${footerHTML}
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
