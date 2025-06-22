const path = require('path');

function getToolConfig(app = 'client') {
  const base = path.resolve(process.cwd(), 'packages', 'shared-config', 'src');

    console.log(`base`, base);
  return {
    app,
    directivesDir: path.join(base, app, 'directives'),
    outputDir: path.join(base, app, 'pageMap'),
    registryPath: path.join(base, app, 'pageMapRegistry.js'),
    routesPath: path.join(base, app, 'routes.js'),
  };
}

module.exports = { getToolConfig };