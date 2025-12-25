import db from '../utils/dbManager.js';
import logger from '../utils/logger.js';

export default async function loadActions() {
  try {
    const [rows] = await db.pool.query(`
      SELECT
        id,
        name,
        trigType,
        htmx_verb,
        is_dom_event,
        content_type,
        endpoint,
        api_id,
        wrkFlow_id,
        controller_id,
        description,
        example
      FROM api_wf.triggers
      WHERE trigType = 'action'
        AND active = 1
    `);

    const actions = {};
    rows.forEach(row => {
      actions[row.name] = {
        id: row.id,
        htmx_verb: row.htmx_verb,
        is_dom_event: row.is_dom_event,
        content_type: row.content_type,
        endpoint: row.endpoint,
        api_id: row.api_id,
        wrkFlow_id: row.wrkFlow_id,
        controller_id: row.controller_id,
        description: row.description,
        example: row.example
      };
    });

    logger.info(`[actionsLoader.js] Loaded ${rows.length} actions`);
    return actions;

  } catch (error) {
    logger.error('[actionsLoader.js] Error loading actions:', error);
    throw error;
  }
}
