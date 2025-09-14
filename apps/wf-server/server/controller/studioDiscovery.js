/**
 * Studio Discovery Controller
 * Discovers apps and pages from Studio eventTypes folder structure
 */

import { promises as fs } from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import logger from "../utils/logger.js";

const codeName = "[studioDiscovery.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Discover all apps/folders in Studio eventTypes
 * GET /api/studio/apps
 */
async function discoverApps(req, res) {
  try {
    logger.debug(`${codeName} Discovering apps from Studio eventTypes`);

    const entries = await fs.readdir(STUDIO_APPS_PATH, { withFileTypes: true });
    
    const allFolders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();

    // Separate apps from templates
    const apps = allFolders.filter(folder => folder !== 'templates');
    const templates = allFolders.filter(folder => folder === 'templates');

    logger.debug(`${codeName} Found ${allFolders.length} total folders: ${apps.length} apps, ${templates.length} template folders`);

    res.json({
      success: true,
      apps: apps,
      templates: templates,
      all: allFolders,
      meta: {
        total: allFolders.length,
        appsCount: apps.length,
        templatesCount: templates.length,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering apps:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to discover Studio apps",
      error: error.message
    });
  }
}

/**
 * Discover all pages for a specific app
 * GET /api/studio/pages/:appName
 */
async function discoverPages(req, res) {
  try {
    const { appName } = req.params;

    if (!appName) {
      return res.status(400).json({
        success: false,
        message: "App name parameter is required"
      });
    }

    logger.debug(`${codeName} Discovering pages for app: ${appName}`);

    const appPagesPath = path.join(STUDIO_APPS_PATH, appName, 'pages');
    
    // Check if pages folder exists
    let pages = [];
    try {
      await fs.access(appPagesPath);
      const entries = await fs.readdir(appPagesPath, { withFileTypes: true });
      
      pages = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();

    } catch (accessError) {
      logger.debug(`${codeName} No pages folder found for ${appName} or folder is empty`);
      // Return empty array - not an error, just no pages yet
    }

    logger.debug(`${codeName} Found ${pages.length} pages for ${appName}: ${pages.join(', ')}`);

    res.json({
      success: true,
      app: appName,
      pages: pages,
      meta: {
        pagesCount: pages.length,
        pagesPath: appPagesPath,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering pages for ${req.params.appName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to discover pages for ${req.params.appName}`,
      error: error.message
    });
  }
}

/**
 * Get complete monorepo structure (apps + their pages)
 * GET /api/studio/structure
 */
async function discoverStructure(req, res) {
  try {
    logger.debug(`${codeName} Discovering complete monorepo structure`);

    // Get all apps first
    const entries = await fs.readdir(STUDIO_APPS_PATH, { withFileTypes: true });
    const allFolders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();

    const structure = {};
    
    // Get pages for each folder
    for (const folder of allFolders) {
      const pagesPath = path.join(STUDIO_APPS_PATH, folder, 'pages');
      
      try {
        await fs.access(pagesPath);
        const pageEntries = await fs.readdir(pagesPath, { withFileTypes: true });
        structure[folder] = pageEntries
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name)
          .sort();
      } catch {
        structure[folder] = []; // No pages folder or empty
      }
    }

    const totalPages = Object.values(structure).flat().length;
    
    logger.debug(`${codeName} Complete structure: ${allFolders.length} folders, ${totalPages} total pages`);

    res.json({
      success: true,
      structure: structure,
      apps: allFolders.filter(f => f !== 'templates'),
      templates: allFolders.filter(f => f === 'templates'),
      meta: {
        foldersCount: allFolders.length,
        totalPages: totalPages,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering structure:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to discover monorepo structure",
      error: error.message
    });
  }
}

/**
 * Get eventType definitions for a specific app and page
 * GET /api/studio/eventTypes/:appName/:pageName
 */
async function discoverEventTypes(req, res) {
  try {
    const { appName, pageName } = req.params;

    if (!appName || !pageName) {
      return res.status(400).json({
        success: false,
        message: "Both app name and page name parameters are required"
      });
    }

    logger.debug(`${codeName} Discovering eventTypes for ${appName}/${pageName}`);

    const pageEventTypesPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'eventTypes');
    
    // Check if page folder exists
    try {
      await fs.access(pageEventTypesPath);
    } catch (accessError) {
      return res.status(404).json({
        success: false,
        message: `Page ${pageName} not found for app ${appName}`,
        path: pageEventTypesPath
      });
    }

    const eventTypes = {};
    
    // Scan all subdirectories (cards, columns, grids, sections, widgets, etc.)
    async function scanDirectory(dirPath, relativePath = '') {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        logger.debug(`${codeName} Scanning directory ${dirPath} with ${entries.length} entries`);
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativeEntryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
          
          logger.debug(`${codeName} Processing entry: ${entry.name} (${entry.isDirectory() ? 'directory' : 'file'})`);
          
          if (entry.isDirectory()) {
            // Recursively scan subdirectories
            await scanDirectory(fullPath, relativeEntryPath);
          } else if (entry.isFile() && entry.name.endsWith('.js')) {
            // Read JS file and parse with babel
            try {
              const fileContent = await fs.readFile(fullPath, 'utf8');
              
              if (!fileContent.trim()) {
                logger.debug(`${codeName} Skipping empty file ${fullPath}`);
                continue;
              }
              
              // Parse with babel
              const ast = parse(fileContent, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'objectRestSpread']
              });
              
              let exportedObject = null;
              let exportName = null;
              
              // Walk through AST nodes to find exports
              const body = ast?.program?.body || ast?.body || [];
              if (Array.isArray(body) && body.length > 0) {
                for (const node of body) {
                  if (node.type === 'ExportNamedDeclaration' && node.declaration) {
                    // Handle: export const varName = {...}
                    if (node.declaration.type === 'VariableDeclaration') {
                      const declarator = node.declaration.declarations[0];
                      if (declarator && declarator.init && declarator.init.type === 'ObjectExpression') {
                        exportName = declarator.id.name;
                        // Extract the complete object from source using start/end positions
                        exportedObject = fileContent.substring(declarator.init.start, declarator.init.end);
                        break;
                      }
                    }
                  } else if (node.type === 'ExportDefaultDeclaration') {
                    // Handle: export default {...}
                    if (node.declaration && node.declaration.type === 'ObjectExpression') {
                      exportName = 'default';
                      exportedObject = fileContent.substring(node.declaration.start, node.declaration.end);
                      break;
                    }
                  }
                }
              } else {
                logger.warn(`${codeName} No valid AST body found for ${fullPath}: program.body=${typeof ast?.program?.body}, body=${typeof ast?.body}, length=${body.length}`);
                continue;
              }
              
              if (exportedObject && exportName) {
                const eventTypeName = path.basename(entry.name, '.js');
                const categoryPath = relativeEntryPath.replace(`/${entry.name}`, '');
                
                // Store with category path info
                eventTypes[`${categoryPath}/${eventTypeName}`] = {
                  name: eventTypeName,
                  exportName: exportName,
                  category: categoryPath,
                  filePath: fullPath.replace('/home/paul/wf-monorepo-new/', ''),
                  definition: exportedObject,
                  relativePath: relativeEntryPath
                };
                
                logger.debug(`${codeName} Extracted eventType ${exportName} from ${eventTypeName}`);
              } else {
                logger.debug(`${codeName} No valid export found in ${fullPath}`);
              }
            } catch (parseError) {
              logger.warn(`${codeName} Could not parse eventType file ${fullPath}: ${parseError.message}`);
            }
          }
        }
      } catch (scanError) {
        logger.warn(`${codeName} Could not scan directory ${dirPath}: ${scanError.message}`);
      }
    }

    await scanDirectory(pageEventTypesPath);
    
    const eventTypeCount = Object.keys(eventTypes).length;
    logger.debug(`${codeName} Found ${eventTypeCount} eventTypes for ${appName}/${pageName}`);

    res.json({
      success: true,
      app: appName,
      page: pageName,
      eventTypes: eventTypes,
      meta: {
        eventTypeCount: eventTypeCount,
        path: pageEventTypesPath,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering eventTypes for ${req.params.appName}/${req.params.pageName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to discover eventTypes for ${req.params.appName}/${req.params.pageName}`,
      error: error.message
    });
  }
}

/**
 * Generate PageConfig for a specific app/page  
 * GET /api/studio/genPageConfig/:appName/:pageName
 */
async function genPageConfig(req, res) {
  try {
    // Support both GET (query params) and POST (body params) for transition period
    const params = req.query.params ? JSON.parse(req.query.params) : req.body?.params;
    const { ':appID': appName, ':pageID': pageName } = params || {};
    
    if (!appName || !pageName) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'appID and pageID parameters are required'
      });
    }
    
    logger.debug(`${codeName} Generating pageConfig for ${appName}/${pageName}`);

    // Import and use the server-side genPageConfig utility
    const { genPageConfig: generatePageConfig } = await import('../utils/genPageConfig.js');
    
    const pageConfig = await generatePageConfig(appName, pageName);
    
    res.json({
      success: true,
      pageConfig: pageConfig,
      meta: {
        app: appName,
        page: pageName,
        eventTypesResolved: pageConfig.eventTypeCount,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error generating pageConfig for ${req.params.appName}/${req.params.pageName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to generate pageConfig for ${req.params.appName}/${req.params.pageName}`,
      error: error.message
    });
  }
}

export { discoverApps, discoverPages, discoverStructure, discoverEventTypes, genPageConfig };