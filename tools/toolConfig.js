const path = require('path');

function getToolConfig(app = 'client') {
  const base = path.resolve(__dirname, '../../', 'packages', 'shared-config', 'src');

  return {
    app,
    directivesDir: path.join(base, app, 'directives'),
    outputDir: path.join(base, app, 'pageMap'),
    registryPath: path.join(base, app, 'pageMapRegistry.js'),
    routesPath: path.join(base, app, 'routes.js'),
  };
}

module.exports = { getToolConfig };