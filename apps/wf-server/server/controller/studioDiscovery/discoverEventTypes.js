/**
 * Studio Discovery - EventTypes Module
 * Discovers all eventTypes for a specific app and page, organized by category
 */

import { promises as fs } from 'fs';
import path from 'path';
import { loadEventTypeFromFile } from '../../utils/pageConfig/astParser.js';
import logger from "../../utils/logger.js";

const codeName = "[discoverEventTypes.js]";
const STUDIO_APPS_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/apps";

/**
 * Discover all eventTypes for a specific app and page
 * GET /api/studio/eventTypes/:appName/:pageName
 */
export async function discoverEventTypes(req, res) {
  try {
    const { appName, pageName } = req.params;

    if (!appName) {
      return res.status(400).json({
        success: false,
        message: "App name parameter is required"
      });
    }

    logger.debug(`${codeName} Discovering eventTypes for app: ${appName}, page: ${pageName}`);

    // Scan the page-specific eventTypes folder (same as genPageConfig)
    const pageEventTypesPath = path.join(STUDIO_APPS_PATH, appName, 'pages', pageName, 'eventTypes');
    
    // Check if page eventTypes folder exists
    try {
      await fs.access(pageEventTypesPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: `EventTypes not found for ${appName}/${pageName}`,
        path: pageEventTypesPath
      });
    }

    // Discover all eventType files in the page folder
    const eventTypeFiles = await scanEventTypeFiles(pageEventTypesPath);

    // Group eventTypes by category for accordion organization
    const eventTypesByCategory = {};
    const categories = [...new Set(eventTypeFiles.map(et => et.category))].sort();
    
    categories.forEach(category => {
      eventTypesByCategory[category] = eventTypeFiles
        .filter(et => et.category === category)
        .map(et => ({
          id: et.eventType,
          name: et.title || et.eventType,
          value: et.eventType,
          category: et.category,
          purpose: et.purpose
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    });

    logger.debug(
      `${codeName} Found ${eventTypeFiles.length} eventTypes for ${appName}/${pageName}`,
      {
        categories: categories,
        categoryCounts: categories.reduce((acc, cat) => {
          acc[cat] = eventTypesByCategory[cat].length;
          return acc;
        }, {})
      }
    );

    res.json({
      success: true,
      rows: eventTypesByCategory,
      meta: {
        app: appName,
        page: pageName,
        total: eventTypeFiles.length,
        categories: categories,
        categoryCounts: categories.reduce((acc, cat) => {
          acc[cat] = eventTypesByCategory[cat].length;
          return acc;
        }, {}),
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering eventTypes for ${req.params.appName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to discover eventTypes for ${req.params.appName}`,
      error: error.message
    });
  }
}

/**
 * Scan eventType files recursively (same logic as genPageConfig's buildEventTypeRegistry)
 */
async function scanEventTypeFiles(basePath) {
  const eventTypes = [];
  
  async function scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          // Extract eventType name from filename
          const eventTypeName = entry.name.replace('.js', '');
          
          // Quick validation and metadata extraction
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            if (!content.trim() || !content.includes('export')) {
              logger.debug(`${codeName} Skipping invalid file: ${eventTypeName}`);
              continue;
            }
            
            // Use proper AST parsing (same as genPageConfig)
            try {
              const eventTypeData = await loadEventTypeFromFile(fullPath);
              if (eventTypeData && eventTypeData.category) {
                eventTypes.push({
                  eventType: eventTypeName, // Use filename as eventType name
                  category: eventTypeData.category,
                  title: eventTypeData.title || eventTypeName,
                  purpose: eventTypeData.purpose || null,
                  filePath: fullPath
                });
                logger.debug(`${codeName} Found eventType: ${eventTypeName} (${eventTypeData.category})`);
              } else {
                logger.debug(`${codeName} No valid eventType data for: ${eventTypeName} - missing category`);
              }
            } catch (parseError) {
              logger.debug(`${codeName} Failed to parse eventType ${eventTypeName}: ${parseError.message}`);
            }
          } catch (error) {
            logger.debug(`${codeName} Error reading file ${eventTypeName}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      logger.debug(`${codeName} Could not scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  await scanDirectory(basePath);
  return eventTypes;
}

