/**
 * Studio Discovery Controller
 * Discovers apps and pages from Studio eventTypes folder structure
 */

import { promises as fs } from 'fs';
import path from 'path';
import logger from "../utils/logger.js";

const codeName = "[studioDiscovery.js]";
const STUDIO_EVENTTYPES_PATH = path.resolve("../wf-studio/src/eventTypes");

/**
 * Discover all apps/folders in Studio eventTypes
 * GET /api/studio/apps
 */
async function discoverApps(req, res) {
  try {
    logger.debug(`${codeName} Discovering apps from Studio eventTypes`);

    const entries = await fs.readdir(STUDIO_EVENTTYPES_PATH, { withFileTypes: true });
    
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

    const appPagesPath = path.join(STUDIO_EVENTTYPES_PATH, appName, 'pages');
    
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
    const entries = await fs.readdir(STUDIO_EVENTTYPES_PATH, { withFileTypes: true });
    const allFolders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();

    const structure = {};
    
    // Get pages for each folder
    for (const folder of allFolders) {
      const pagesPath = path.join(STUDIO_EVENTTYPES_PATH, folder, 'pages');
      
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

export { discoverApps, discoverPages, discoverStructure };