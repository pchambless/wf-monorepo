import { packagePaths, resolvePackage } from '@whatsfresh/shared-imports/paths';
import path from 'path';

export function getToolConfig(app = 'client') {
  // Use shared-imports for clean path resolution
  const base = packagePaths.sharedConfig;

  console.log(`🔧 Config for ${app}:`, base);
  return {
    app,
    directivesDir: path.join(base, app, 'directives'),
    outputDir: path.join(base, app, 'pageMap'),
    registryPath: resolvePackage('sharedConfig', app, 'pageMapRegistry.js'),
    routesPath: resolvePackage('sharedConfig', app, 'routes.js'),
  };
}