const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Properly resolve workspace packages
      webpackConfig.resolve.symlinks = false;

      // Define shared-imports package path
      const sharedPackagePath = path.resolve(__dirname, '../../packages/shared-imports');

      // Remove source-map-loader to avoid JSX parsing conflicts
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        if (rule.enforce === 'pre' && rule.use) {
          const hasSourceMapLoader = rule.use.some(loader => {
            if (typeof loader === 'string') {
              return loader.includes('source-map-loader');
            }
            if (typeof loader === 'object' && loader.loader) {
              return loader.loader.includes('source-map-loader');
            }
            return false;
          });

          if (hasSourceMapLoader) {
            console.log('Removing source-map-loader rule for Studio');
            return false;
          }
        }
        return true;
      });

      // Add babel processing rule for shared-imports package
      const sharedPackageRule = {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          sharedPackagePath,
          (modulePath) => modulePath.includes('@whatsfresh/shared-imports')
        ],
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('@babel/preset-react'), {
                runtime: 'automatic'
              }],
              [require.resolve('@babel/preset-env'), {
                targets: 'defaults'
              }]
            ],
            plugins: [
              require.resolve('@babel/plugin-transform-runtime')
            ],
            cacheDirectory: false,
            cacheCompression: false,
            babelrc: false,
            configFile: false
          }
        }
      };

      // Add the babel rule for processing shared-imports package
      webpackConfig.module.rules.unshift(sharedPackageRule);
      console.log('Added babel rule for shared-imports in Studio');

      return webpackConfig;
    }
  }
};