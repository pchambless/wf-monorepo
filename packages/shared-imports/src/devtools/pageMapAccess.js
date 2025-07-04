/**
 * DevTools PageMap Access Functions
 * Provides clean API for devtools to access generated pageMaps in apps
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get a specific pageMap from an app
 * @param {string} app - 'client' or 'admin'
 * @param {string} entityName - e.g. 'prodTypeList'
 * @returns {Promise<Object|null>} pageMap configuration or null if not found
 */
export async function getPageMap(app, entityName) {
  try {
    // Get entity registry to find the page path
    const entityRegistry = await getEntityRegistry(app);
    const entity = entityRegistry[entityName];
    
    if (!entity || !entity.pageIndexPath) {
      console.warn(`No pageIndexPath found for ${entityName} in ${app} app`);
      return null;
    }
    
    // Extract directory path from pageIndexPath
    const pathParts = entity.pageIndexPath.split('/');
    const dirPath = pathParts.slice(0, -1).join('/');
    
    // Construct path to pageMap in app
    const pageMapPath = path.resolve(
      __dirname, 
      `../../../apps/wf-${app}/src/pages/${dirPath}/pageMap.js`
    );
    
    // Import the pageMap
    const pageMapUrl = pathToFileURL(pageMapPath).href;
    const module = await import(pageMapUrl);
    
    return module.default;
    
  } catch (error) {
    console.warn(`Could not load pageMap for ${entityName} from ${app} app:`, error.message);
    return null;
  }
}

/**
 * Get all pageMaps for an app
 * @param {string} app - 'client' or 'admin'
 * @returns {Promise<Object>} Object with entityName as keys, pageMaps as values
 */
export async function getAllPageMaps(app) {
  try {
    const entityRegistry = await getEntityRegistry(app);
    const pageMaps = {};
    
    // Process each entity that has a pageMap
    for (const [entityName, entity] of Object.entries(entityRegistry)) {
      if (entity.layout === 'CrudLayout') {
        const pageMap = await getPageMap(app, entityName);
        if (pageMap) {
          pageMaps[entityName] = pageMap;
        }
      }
    }
    
    return pageMaps;
    
  } catch (error) {
    console.error(`Error loading all pageMaps for ${app} app:`, error.message);
    return {};
  }
}

/**
 * Get entity registry for an app
 * @param {string} app - 'client' or 'admin'
 * @returns {Promise<Object>} Entity registry
 */
async function getEntityRegistry(app) {
  const registryPath = path.resolve(
    __dirname,
    `../../shared-config/src/${app}/pageMapRegistry.js`
  );
  
  const registryUrl = pathToFileURL(registryPath).href;
  const module = await import(registryUrl);
  
  return module.entityRegistry;
}

/**
 * Check if a pageMap exists for an entity
 * @param {string} app - 'client' or 'admin'
 * @param {string} entityName - e.g. 'prodTypeList'
 * @returns {Promise<boolean>} True if pageMap exists
 */
export async function pageMapExists(app, entityName) {
  const pageMap = await getPageMap(app, entityName);
  return pageMap !== null;
}

/**
 * Get pageMap path for an entity (useful for debugging)
 * @param {string} app - 'client' or 'admin'
 * @param {string} entityName - e.g. 'prodTypeList'
 * @returns {Promise<string|null>} Absolute path to pageMap file or null
 */
export async function getPageMapPath(app, entityName) {
  try {
    const entityRegistry = await getEntityRegistry(app);
    const entity = entityRegistry[entityName];
    
    if (!entity || !entity.pageIndexPath) {
      return null;
    }
    
    const pathParts = entity.pageIndexPath.split('/');
    const dirPath = pathParts.slice(0, -1).join('/');
    
    return path.resolve(
      __dirname, 
      `../../../apps/wf-${app}/src/pages/${dirPath}/pageMap.js`
    );
    
  } catch (error) {
    return null;
  }
}