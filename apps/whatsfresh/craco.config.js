const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin to allow imports from outside src/
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        plugin => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // Properly resolve workspace packages
      webpackConfig.resolve.symlinks = false;

      // Force single React instance - critical for hooks to work
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
      };

      return webpackConfig;
    }
  }
};
