import { promises as fs } from 'fs';
import path from 'path';
import logger from "../utils/logger.js";

const codeName = "[fetchQueryEvents.js]";
const EVENTS_BASE_PATH = path.join(process.cwd(), 'server', 'events');

/**
 * Fetch available database query events for a specific app
 * Used to populate cardDBQuery dropdown with actual server queries
 */
async function fetchQueryEvents(req, res) {
  try {
    const { app } = req.query;
    
    if (!app) {
      return res.status(400).json({
        success: false,
        message: "App parameter is required"
      });
    }

    const appEventsPath = path.join(EVENTS_BASE_PATH, app);
    
    // Check if app events directory exists
    try {
      await fs.access(appEventsPath);
    } catch {
      return res.json({
        success: true,
        data: [],
        app: app,
        message: `No queries found for app: ${app}`
      });
    }

    // Read all .js files in the app events directory
    const files = await fs.readdir(appEventsPath);
    const queryFiles = files.filter(file => 
      file.endsWith('.js') && 
      file !== 'index.js' // Skip index file
    );

    // Convert filenames to query names (no formatting, keep as-is)
    const queryNames = queryFiles.map(file => ({
      name: file.replace('.js', ''),
      app: app
    }));

    // Sort alphabetically
    queryNames.sort((a, b) => a.name.localeCompare(b.name));

    logger.debug(`${codeName} Found ${queryNames.length} queries for app: ${app}`, {
      app,
      queries: queryNames.map(q => q.name)
    });

    res.json({
      success: true,
      data: queryNames,
      app: app,
      count: queryNames.length
    });

  } catch (error) {
    logger.error(`${codeName} Error fetching query events:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch query events",
      error: error.message
    });
  }
}

export { fetchQueryEvents };