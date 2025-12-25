import db from '../utils/dbManager.js';
import logger from '../utils/logger.js';

export default async function loadPageConfigs() {
  try {
    const [rows] = await db.pool.query(`
      SELECT
        pageID,
        pageName,
        appName,
        appID,
        status,
        tableName,
        template_type,
        parentID,
        tableID,
        contextKey,
        pageTitle,
        formHeadCol
      FROM api_wf.vw_page_analysis
      WHERE status != 'Deleted'
    `);

    const configs = {};
    rows.forEach(row => {
      configs[row.pageName] = row;
    });

    logger.info(`[pageConfigLoader.js] Loaded ${rows.length} page configs`);
    return configs;

  } catch (error) {
    logger.error('[pageConfigLoader.js] Error loading page configs:', error);
    throw error;
  }
}
