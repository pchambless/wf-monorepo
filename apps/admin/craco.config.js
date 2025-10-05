const path = require('path');

const sharedPackages = [
  path.resolve(__dirname, '../../packages/shared-ui'),
  path.resolve(__dirname, '../../packages/shared-config'),
  path.resolve(__dirname, '../../packages/shared-api'),
  path.resolve(__dirname, '../../packages/shared-events')
];

module.exports = {
  webpack: {
    alias: {
      '@shared-ui': sharedPackages[0],
      '@shared-config': sharedPackages[1],
      '@shared-api': sharedPackages[2],
      '@shared-events': sharedPackages[3]
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.symlinks = true;

      // ⚠️ CRITICAL: Remove the import restriction
      webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
        if (Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach(loader => {
            if (
              loader.loader &&
              loader.loader.includes('babel-loader') &&
              Array.isArray(loader.include)
            ) {
              loader.include.push(...sharedPackages.map(pkg => path.resolve(pkg, 'src')));
            }
          });
        }
        return rule;
      });

      return webpackConfig;
    }
  }
};