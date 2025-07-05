const path = require('path');

module.exports = {
  webpack: {
    // Disable source maps for shared packages to avoid JSX parsing issues
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
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
      '@shared-config': path.resolve(__dirname, '../../packages/shared-config'), // Direct access to shared package

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

      // wf-monorepo-new shared links
      '@pageMap': path.resolve(__dirname, '../../packages/shared-config/src/pageMap'),
      '@eventTypes': path.resolve(__dirname, '../../packages/shared-config/src/events'),
      '@routes': path.resolve(__dirname, '../../packages/shared-config/src/routes'),
    },

    // Add this to properly resolve workspace packages
    configure: (webpackConfig) => {
      // Properly resolve workspace packages
      webpackConfig.resolve.symlinks = false; // Changed to false for monorepo

      // Define shared package paths
      const sharedPackagePaths = [
        path.resolve(__dirname, '../../packages/shared-ui'),
        path.resolve(__dirname, '../../packages/shared-config'),
        path.resolve(__dirname, '../../packages/shared-imports'),
        path.resolve(__dirname, '../../packages/shared-api'),
        path.resolve(__dirname, '../../packages/shared-events'),
      ];

      // Create function to check if a file is from shared packages
      const isFromSharedPackage = (filePath) => {
        return sharedPackagePaths.some(packagePath =>
          path.normalize(filePath).includes(path.normalize(packagePath))
        );
      };

      // Add a rule that explicitly excludes shared packages from source-map-loader
      // This must come BEFORE any source-map-loader rules
      const excludeSourceMapRule = {
        test: /\.(js|jsx|ts|tsx)$/,
        include: sharedPackagePaths,
        enforce: 'pre',
        loader: 'null-loader' // This prevents any other pre-loaders from processing these files
      };

      // Completely remove source-map-loader rules for shared packages
      webpackConfig.module.rules = webpackConfig.module.rules.filter(rule => {
        // Remove any pre-loader rules that contain source-map-loader for shared packages
        if (rule.enforce === 'pre' && rule.test && rule.use) {
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
            console.log('Completely removing source-map-loader rule to prevent JSX parsing conflicts');
            return false; // Remove this rule entirely
          }
        }
        return true; // Keep all other rules
      });

      // Debug: Log the paths we're trying to include
      console.log('Shared package paths:', sharedPackagePaths);

      // Debug: Test one of the problematic files
      const testFile = '/home/paul/wf-monorepo-new/packages/shared-ui/src/components/auth/LoginForm/LoginForm.jsx';
      console.log('Test file would be included:', sharedPackagePaths.some(packagePath =>
        testFile.includes(packagePath)
      ));

      // Add babel processing rule for shared packages with high priority
      const sharedPackagesRule = {
        test: /\.(js|jsx|ts|tsx)$/,
        include: sharedPackagePaths,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('@babel/preset-env'), {
                targets: 'defaults'
              }],
              [require.resolve('@babel/preset-react'), {
                runtime: 'automatic'
              }]
            ],
            plugins: [
              require.resolve('@babel/plugin-transform-runtime')
            ],
            cacheDirectory: false, // Disable cache for debugging
          }
        }
      };

      // Add the source-map exclusion rule at the very beginning for highest priority
      webpackConfig.module.rules.unshift(excludeSourceMapRule);

      // Add the babel rule for processing shared packages
      webpackConfig.module.rules.unshift(sharedPackagesRule);
      console.log('Added high-priority babel rule for shared packages');
      console.log('Total module rules:', webpackConfig.module.rules.length);
      return webpackConfig;
    }
  },
};
