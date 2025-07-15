import { packagePaths, resolvePackage } from '@whatsfresh/shared-imports/paths';
import path from 'path';

export function getToolConfig(app = 'client') {
  // Directives are now in devtools (generated artifacts)
  const devtoolsBase = packagePaths.devtools;

  console.log(`🔧 Config for ${app}:`, devtoolsBase);
  console.log(`🔧 Devtools base:`, devtoolsBase);

  return {
    app,
    directivesDir: path.join(devtoolsBase, 'automation/data/directives'),
    outputDir: devtoolsBase, // Not used anymore - pages go directly to app directories
    registryPath: path.join(devtoolsBase, 'registries', app, 'pageMapRegistry.js'),
    routesPath: path.join(devtoolsBase, 'registries', app, 'routes.js'),
  };
}