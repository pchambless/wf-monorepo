import db from '../utils/dbManager.js';
import logger from '../utils/logger.js';

export default async function loadActions() {
  try {
    const [actionRows] = await db.pool.query(`
      SELECT
        name,
        htmx_verb,
        endpoint,
        config,
        example
      FROM api_wf.vw_trigger_action
    `);

    const [classRows] = await db.pool.query(`
      SELECT
        class,
        is_dom_event
      FROM api_wf.vw_trigger_class
    `);

    const actions = {};
    actionRows.forEach(row => {
      actions[row.name] = {
        htmx_verb: row.htmx_verb,
        content_type: row.content_type,
        endpoint: row.endpoint,
        config: row.config,
        example: row.example
      };
    });

    const triggerClasses = {};
    classRows.forEach(row => {
      triggerClasses[row.class] = {
        is_dom_event: row.is_dom_event
      };
    });

    logger.info(`[actionsLoader.js] Loaded ${actionRows.length} actions and ${classRows.length} trigger classes`);

    return {
      actions,
      triggerClasses
    };

  } catch (error) {
    logger.error('[actionsLoader.js] Error loading actions:', error);
    throw error;
  }
}
