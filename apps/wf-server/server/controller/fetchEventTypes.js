import { getAllEvents } from "@whatsfresh/shared-imports/events";
import logger from "../utils/logger.js";

const codeName = "[fetchEventTypes.js]";

async function fetchEventTypes(req, res) {
  try {
    const { category = "query" } = req.query;

    let eventTypesArray;
    if (category === "all" || category === "layout") {
      // Import layout eventTypes for Studio
      const { getSafeEventTypes } = await import(
        "@whatsfresh/shared-imports/events"
      );
      eventTypesArray = getSafeEventTypes();

      if (category === "layout") {
        // Filter to layout eventTypes only
        eventTypesArray = eventTypesArray.filter((et) =>
          ["page", "tab", "appbar", "sidebar"].includes(et.category)
        );
      }
    } else {
      // Default: query eventTypes only (for server operations)
      eventTypesArray = getAllEvents();
    }

    logger.debug(`${codeName} Returning ${category} event types`, {
      category,
      count: eventTypesArray.length,
    });

    res.json({
      success: true,
      data: eventTypesArray,
      category: category,
    });
  } catch (error) {
    logger.error(`${codeName} Error fetching event types:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event types",
      error: error.message,
    });
  }
}

export { fetchEventTypes };
