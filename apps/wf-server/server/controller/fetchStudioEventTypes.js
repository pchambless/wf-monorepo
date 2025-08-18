/**
 * fetchStudioEventTypes Controller
 * Fetches all eventTypes (layout + query) for a specific app
 * Used by Studio for hierarchy and component palette
 */

import { getAppAllEvents } from "@whatsfresh/shared-imports/events";
import logger from "../utils/logger.js";

const codeName = "[fetchStudioEventTypes.js]";

/**
 * Fetch all eventTypes for Studio use
 * GET /api/studio/eventTypes/:app
 */
async function fetchStudioEventTypes(req, res) {
  try {
    const { app } = req.params;

    if (!app) {
      return res.status(400).json({
        success: false,
        message: "App parameter is required",
      });
    }

    logger.debug(`${codeName} Fetching Studio eventTypes for app: ${app}`);

    // Get all eventTypes (layout + query) for the specified app
    const eventTypes = await getAppAllEvents(app);

    logger.debug(
      `${codeName} Found ${eventTypes.length} eventTypes for ${app}`,
      {
        layoutCount: eventTypes.filter((et) =>
          ["page", "tab", "appbar", "sidebar"].includes(et.category)
        ).length,
        queryCount: eventTypes.filter((et) =>
          ["grid", "form", "ui:Select"].includes(et.category)
        ).length,
      }
    );

    res.json({
      success: true,
      app: app,
      eventTypes: eventTypes,
      meta: {
        total: eventTypes.length,
        layoutCount: eventTypes.filter((et) =>
          ["page", "tab", "appbar", "sidebar"].includes(et.category)
        ).length,
        queryCount: eventTypes.filter((et) =>
          ["grid", "form", "ui:Select"].includes(et.category)
        ).length,
        categories: [...new Set(eventTypes.map((et) => et.category))],
        generated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`${codeName} Error fetching Studio eventTypes:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Studio eventTypes",
      error: error.message,
    });
  }
}

export { fetchStudioEventTypes };
