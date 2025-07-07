const path = require('path');

// Helper to get absolute path to shared-imports package
const getSharedPackagePath = () => {
  const packagePath = path.resolve(__dirname, '../../packages/shared-imports');
  console.log('Shared package path:', packagePath);
  return packagePath;
};

module.exports = {
  webpack: {
    // Disable source maps for shared packages to avoid JSX parsing issues
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,

    configure: (webpackConfig) => {
      // Properly resolve workspace packages
      webpackConfig.resolve.symlinks = false; // Changed to false for monorepo

      // Define shared-imports package path
      const sharedPackagePath = path.resolve(__dirname, '../../packages/shared-imports');

      // COMPLETELY REMOVE source-map-loader to avoid JSX parsing conflicts
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
            console.log('Completely removing source-map-loader rule');
            return false; // Remove this rule entirely
          }
        }
        return true;
      });

      // Debug: Log the path we're trying to include
      console.log('Shared package path:', sharedPackagePath);

      // Also include the node_modules symlink path
      const nodeModulesSharedPath = path.resolve(__dirname, 'node_modules/@whatsfresh/shared-imports');
      console.log('Node modules shared path:', nodeModulesSharedPath);

      // Debug: Test one of the files
      const testFile = '/home/paul/wf-monorepo-new/packages/shared-imports/src/components/auth/LoginForm/LoginForm.jsx';
      console.log('Test file would be included:', testFile.includes(sharedPackagePath));

      // Add babel processing rule for shared-imports package with high priority
      const sharedPackageRule = {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          sharedPackagePath,
          nodeModulesSharedPath,
          // Also try to catch any path containing shared-imports
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
            cacheDirectory: false, // Disable cache for shared packages
            cacheCompression: false
            babelrc: false,
            configFile: false
          }
        }
      };

      // Add the babel rule for processing shared-imports package
      webpackConfig.module.rules.unshift(sharedPackageRule);
      console.log('Added high-priority babel rule for shared-imports package');

      // Also need to exclude shared-imports from source-map-loader
      webpackConfig.module.rules.forEach((rule, index) => {
        if (rule.enforce === 'pre' && rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(useItem => {
            if (useItem.loader && useItem.loader.includes('source-map-loader')) {
              if (!useItem.exclude) {
                useItem.exclude = [];
              }
              if (Array.isArray(useItem.exclude)) {
                useItem.exclude.push(sharedPackagePath);
              } else {
                useItem.exclude = [useItem.exclude, sharedPackagePath];
              }
              console.log(`Updated source-map-loader rule ${index} to exclude shared-imports`);
            }
          });
        }
        // Also check for single loader format
        if (rule.enforce === 'pre' && rule.loader && rule.loader.includes('source-map-loader')) {
          if (!rule.exclude) {
            rule.exclude = [];
          }
          if (Array.isArray(rule.exclude)) {
            rule.exclude.push(sharedPackagePath);
          } else {
            rule.exclude = [rule.exclude, sharedPackagePath];
          }
          console.log(`Updated source-map-loader rule ${index} to exclude shared-imports`);
        }
      });

      console.log('Total module rules:', webpackConfig.module.rules.length);

      return webpackConfig;
    },
    alias: {
      // Top Level Folders
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@actions': path.resolve(__dirname, 'src/actions'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@pages': path.resolve(__dirname, 'src/pages'), // Now points to new pages folder
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@config': path.resolve(__dirname, 'src/config'), // Local configs still in transition
      // '@shared-config': removed - using app-specific configs now

      // App Components 
      '@layout': path.resolve(__dirname, 'src/layouts'),
      '@navigation': path.resolve(__dirname, 'src/components/1-page/b-navigation'),
      // '@crud': removed - using @whatsfresh/shared-imports package imports
      '@appbar': path.resolve(__dirname, 'src/components/1-page/b-navigation/aa-AppBar'),
      '@sidebar': path.resolve(__dirname, 'src/components/1-page/b-navigation/bb-Sidebar'),
      '@pageheader': path.resolve(__dirname, 'src/components/1-page/b-navigation/cc-PageHeader'),
      '@nav': path.resolve(__dirname, 'src/navigation'),
      // Common components  
      '@form': path.resolve(__dirname, 'src/components/2-form'),
      '@table': path.resolve(__dirname, 'src/components/2-form/a-table'),
      '@common': path.resolve(__dirname, 'src/components/3-common'),
      // '@modal': removed - using @whatsfresh/shared-imports package imports

      // Routes 
      '@route': path.resolve(__dirname, 'src/routes'),

      // Page Components - Updated to new location
      '@login': path.resolve(__dirname, 'src/pages/0-Auth/01-Login'),
      '@dashboard': path.resolve(__dirname, 'src/pages/1-Dashboard'),
      '@ingredient': path.resolve(__dirname, 'src/pages/2-Ingredient'),
      '@product': path.resolve(__dirname, 'src/pages/3-Product'),
      '@account': path.resolve(__dirname, 'src/pages/4-Account'),
      '@mapping': path.resolve(__dirname, 'src/pages/5-Mapping'),

      // Hooks
      '@entityHooks': path.resolve(__dirname, 'src/hooks/1-entity'),
      '@formHooks': path.resolve(__dirname, 'src/hooks/2-form'),

      // wf-monorepo-new shared links - now using app-specific configs
      // '@pageMap': removed - using app-specific configs
      // '@eventTypes': removed - using app-specific configs  
      // '@routes': removed - using app-specific configs
    }
  },
};
