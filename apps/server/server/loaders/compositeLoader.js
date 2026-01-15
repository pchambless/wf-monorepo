// Loader for all composites

import dbManager from '../utils/dbManager.js';
import logger from '../utils/logger.js';

// Loads all composites from vw_Composites and keys by name
export default async function loadComposites() {
  const [composites] = await dbManager.pool.query('SELECT * FROM api_wf.vw_composites');
  const byName = {};
  for (const comp of composites) {
    // Parse JSON columns
    if (typeof comp.components === 'string') {
      comp.components = JSON.parse(comp.components);
    }
    if (typeof comp.props === 'string') {
      comp.props = JSON.parse(comp.props);
    }
    byName[comp.name] = comp;
  }
  logger.info(`[compositeLoader.js] Loaded ${Object.keys(byName).length} composites`);
  return byName;
}
