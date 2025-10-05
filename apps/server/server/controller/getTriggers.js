import { executeQuery } from '../utils/dbUtils.js';
import logger from '../utils/logger.js';

const codeName = `[getTriggers.js]`;

const getTriggers = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const query = `
      SELECT
        id,
        name,
        trigType,
        is_dom_event,
        description
      FROM api_wf.triggers
      WHERE active = 1
      ORDER BY trigType, name
    `;

    logger.debug(`${codeName} Fetching all active triggers`);

    const results = await executeQuery(query, 'GET');

    const triggers = results.map(tr => ({
      id: tr.id,
      name: tr.name,
      trigType: tr.trigType,
      is_dom_event: tr.is_dom_event === 1,
      description: tr.description
    }));

    logger.info(`${codeName} Fetched ${triggers.length} triggers`);
    res.json(triggers);

  } catch (error) {
    logger.error(`${codeName} Failed to fetch triggers:`, error);
    res.status(500).json({
      error: 'TRIGGERS_FETCH_FAILED',
      message: error.message
    });
  }
};

export default getTriggers;
