// Loader for base-component renderers

import dbManager from '../utils/dbManager.js';
import * as renderers from '../renderers/index.js';
import logger from '../utils/logger.js';

// Loads all base-components from vw_HTMXRegistry and maps to renderer functions
export default async function loadRenderRegistry() {
  const [baseComponents] = await dbManager.pool.query('SELECT * FROM api_wf.vw_HTMXRegistry');
  const registry = {};
  for (const comp of baseComponents) {
    // comp.renderer = 'renderText.js', need to convert to 'renderText'
    const rendererName = comp.renderer.replace('.js', '');
    const fn = renderers[rendererName];
    if (fn) {
      registry[comp.name] = { fn, defaultProps: comp.props };
      logger.debug(`[renderRegistry.js] Mapped ${comp.name} → ${rendererName}`);
    } else {
      logger.warn(`[renderRegistry.js] Renderer not found for ${comp.name}: ${rendererName}`);
    }
  }
  logger.info(`[renderRegistry.js] Loaded ${Object.keys(registry).length} base-components`);
  return registry;
}
