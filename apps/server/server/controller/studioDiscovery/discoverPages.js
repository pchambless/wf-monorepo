/**
 * Studio Discovery - Pages Module
 * Discovers all pages for a specific app
 */

import { promises as fs } from 'fs';
import path from 'path';
import logger from "../../utils/logger.js";

const codeName = "[discoverPages.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Discover all pages for a specific app
 * POST /api/studio/pages
 */
export async function discoverPages(req, res) {
  try {
    // Support both GET (query params) and POST (body params) for transition period
    const params = req.query.params ? JSON.parse(req.query.params) : req.body?.params;
    const appName = params?.[':appID'];

    if (!appName) {
      return res.status(400).json({
        success: false,
        message: "App name parameter (:appID) is required"
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
        .map(entry => ({
          id: entry.name,
          name: entry.name,
          value: entry.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    } catch (accessError) {
      logger.debug(`${codeName} No pages folder found for ${appName} or folder is empty`);
      // Return empty array - not an error, just no pages yet
    }

    logger.debug(`${codeName} Found ${pages.length} pages for ${appName}: ${pages.join(', ')}`);

    res.json({
      success: true,
      rows: pages,
      meta: {
        app: appName,
        pagesCount: pages.length,
        pagesPath: appPagesPath,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    const fallbackParams = req.query.params ? JSON.parse(req.query.params) : req.body?.params;
    const appName = fallbackParams?.[':appID'] || 'unknown';
    logger.error(`${codeName} Error discovering pages for ${appName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to discover pages for ${appName}`,
      error: error.message
    });
  }
}