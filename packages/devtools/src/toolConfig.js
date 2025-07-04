import { packagePaths, resolvePackage } from '@whatsfresh/shared-imports/paths';
import path from 'path';

export function getToolConfig(app = 'client') {
  // Use shared-imports for clean path resolution
  const base = packagePaths.sharedConfig;

  // Directives are now in devtools (generated artifacts)
  const devtoolsBase = packagePaths.devtools;

  console.log(`🔧 Config for ${app}:`, base);
  console.log(`🔧 Devtools base:`, devtoolsBase);

  return {
    app,
    directivesDir: path.join(devtoolsBase, 'automation/page/directives'),
    outputDir: path.join(base, app, 'pageMap'),
    registryPath: resolvePackage('sharedConfig', app, 'pageMapRegistry.js'),
    routesPath: resolvePackage('sharedConfig', app, 'routes.js'),
  };
}