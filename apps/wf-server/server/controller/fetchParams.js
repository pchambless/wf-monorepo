import { getEventType } from "../events/index.js";
import logger from "../utils/logger.js";

const codeName = "[fetchParams.js]";

async function fetchParams(req, res) {
  try {
    const { eventTypeName } = req.params;

    if (!eventTypeName) {
      return res.status(400).json({
        success: false,
        message: "EventType name is required",
      });
    }

    const eventDef = getEventType(eventTypeName);
    if (!eventDef) {
      return res.status(404).json({
        success: false,
        message: `EventType '${eventTypeName}' not found`,
      });
    }

    const params = eventDef.params || [];

    logger.debug(`${codeName} Returning params for eventType: ${eventTypeName}`, {
      params,
      count: params.length,
    });

    res.json({
      success: true,
      eventType: eventTypeName,
      params,
    });
  } catch (error) {
    logger.error(`${codeName} Error fetching eventType params:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch eventType parameters",
      error: error.message,
    });
  }
}

export { fetchParams };