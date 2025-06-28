const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@shared-ui': path.resolve(__dirname, '../../packages/shared-ui'),
      '@shared-config': path.resolve(__dirname, '../../packages/shared-config'),
      // Add more aliases as needed to match what the Client app uses
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.symlinks = true;
      return webpackConfig;
    }
  }
};