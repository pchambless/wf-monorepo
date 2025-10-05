import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';

const codeName = `[getEventTypes.js]`;

const getEventTypes = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const query = `
      SELECT
        id,
        name,
        category,
        title,
        style,
        config,
        purpose
      FROM api_wf.eventType
      WHERE active = 1
      ORDER BY Hier, name
    `;

    logger.debug(`${codeName} Fetching all active eventTypes`);

    const results = await executeQuery(query, 'GET');

    const eventTypes = results.map(et => {
      let parsedStyle = null;
      let parsedConfig = null;

      try {
        parsedStyle = et.style ? JSON.parse(et.style) : null;
      } catch (e) {
        logger.warn(`${codeName} Invalid JSON in style for ${et.name}: ${e.message}`);
        parsedStyle = et.style;
      }

      try {
        parsedConfig = et.config ? JSON.parse(et.config) : null;
      } catch (e) {
        logger.warn(`${codeName} Invalid JSON in config for ${et.name}: ${e.message}`);
        parsedConfig = et.config;
      }

      return {
        id: et.id,
        name: et.name,
        category: et.category,
        title: et.title,
        style: parsedStyle,
        config: parsedConfig,
        purpose: et.purpose
      };
    });

    logger.info(`${codeName} Fetched ${eventTypes.length} eventTypes`);
    res.json(eventTypes);

  } catch (error) {
    logger.error(`${codeName} Failed to fetch eventTypes:`, error);
    res.status(500).json({
      error: 'EVENTTYPES_FETCH_FAILED',
      message: error.message
    });
  }
};

export default getEventTypes;
