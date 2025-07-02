/**
 * Clean import aliases for the WhatsFresh monorepo
 * Usage: import { sharedConfig } from '@whatsfresh/shared-imports/imports';
 */
import { packagePaths } from './paths.js';
import path from 'path';

/**
 * Clean imports for shared-config package
 */
export const sharedConfig = {
  client: {
    pageMapRegistry: () => import(path.join(packagePaths.sharedConfig, 'client/pageMapRegistry.js')),
    directives: (name) => import(path.join(packagePaths.sharedConfig, `client/directives/${name}.js`)),
    routes: () => import(path.join(packagePaths.sharedConfig, 'client/routes.js'))
  },
  admin: {
    pageMapRegistry: () => import(path.join(packagePaths.sharedConfig, 'admin/pageMapRegistry.js')),
    directives: (name) => import(path.join(packagePaths.sharedConfig, `admin/directives/${name}.js`)),
    routes: () => import(path.join(packagePaths.sharedConfig, 'admin/routes.js'))
  },
  common: {
    directiveMap: () => import(path.join(packagePaths.sharedConfig, 'common/directiveMap.js'))
  }
};

/**
 * Clean imports for shared-ui package
 */
export const sharedUI = {
  registry: () => import(path.join(packagePaths.sharedUI, 'widgets/index.js')),
  components: (name) => import(path.join(packagePaths.sharedUI, `components/${name}/index.js`)),
  widgets: (name) => import(path.join(packagePaths.sharedUI, `widgets/${name}/index.js`))
};

/**
 * Clean imports for shared-events package
 */
export const sharedEvents = {
  client: {
    eventTypes: () => import(path.join(packagePaths.sharedEvents, 'client/eventTypes.js'))
  },
  server: {
    eventTypes: () => import(path.join(packagePaths.sharedEvents, 'server/eventTypes.js'))
  }
};

/**
 * Clean imports for devtools package
 */
export const devtools = {
  automation: {
    genPageMaps: () => import(path.join(packagePaths.devtools, 'automation/page/genPageMaps.js')),
    genDirectives: () => import(path.join(packagePaths.devtools, 'automation/page/genDirectives.js'))
  },
  docs: {
    genMasterDocs: () => import(path.join(packagePaths.devtools, 'docs/automation/genMasterDocs.js'))
  }
};

/**
 * Helper function to dynamically import any file from any package
 */
export function importFrom(packageName, filePath) {
  const basePath = packagePaths[packageName];
  if (!basePath) {
    throw new Error(`Unknown package: ${packageName}. Available: ${Object.keys(packagePaths).join(', ')}`);
  }
  return import(path.join(basePath, filePath));
}

/**
 * Batch import multiple modules
 */
export async function importBatch(imports) {
  const results = {};
  for (const [key, importFn] of Object.entries(imports)) {
    try {
      results[key] = await importFn();
    } catch (error) {
      console.warn(`Failed to import ${key}:`, error.message);
      results[key] = null;
    }
  }
  return results;
}

// Example usage:
// const modules = await importBatch({
//   registry: sharedConfig.client.pageMapRegistry,
//   widgets: sharedUI.registry,
//   eventTypes: sharedEvents.client.eventTypes
// });