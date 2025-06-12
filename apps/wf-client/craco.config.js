const path = require('path');

module.exports = {
  webpack: {
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
      '@crud': path.resolve(__dirname, 'src/components/1-page/c-crud'),
      '@appbar': path.resolve(__dirname, 'src/components/1-page/b-navigation/aa-AppBar'),
      '@sidebar': path.resolve(__dirname, 'src/components/1-page/b-navigation/bb-Sidebar'),
      '@pageheader': path.resolve(__dirname, 'src/components/1-page/b-navigation/cc-PageHeader'),
      '@nav': path.resolve(__dirname, 'src/navigation'),
      // Common components  
      '@form': path.resolve(__dirname, 'src/components/2-form'),
      '@table': path.resolve(__dirname, 'src/components/2-form/a-table'),
      '@common': path.resolve(__dirname, 'src/components/3-common'),
      '@modal': path.resolve(__dirname, 'src/components/3-common/a-modal'),
      
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
      webpackConfig.resolve.symlinks = true;
      return webpackConfig;
    }
  },
};
