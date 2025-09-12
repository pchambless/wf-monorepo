/**
 * Studio Discovery - Apps Module
 * Discovers all apps/folders in Studio eventTypes structure
 */

import { promises as fs } from 'fs';
import logger from "../../utils/logger.js";

const codeName = "[discoverApps.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Discover all apps/folders in Studio eventTypes
 * GET /api/studio/apps
 */
export async function discoverApps(req, res) {
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

    // Transform apps array into objects for SelectRenderer
    const appsWithMetadata = apps.map(app => ({
      id: app,
      name: app,
      value: app
    }));

    res.json({
      success: true,
      rows: appsWithMetadata,
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