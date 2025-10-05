const path = require('path');

/** @type {import('unimported').UnimportedConfig} */
module.exports = {
  // Entry points to start analysis from
  entryPoints: [
    'src/index.js',
  ],
  
  // Flow analysis options
  flow: {
    // Add your aliases from craco.config.js
    aliases: {
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@actions': path.resolve(__dirname, 'src/actions'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@layout': path.resolve(__dirname, 'src/components/1-page/a-layout'),
      '@navigation': path.resolve(__dirname, 'src/components/1-page/b-navigation-mobx'),
      '@crud': path.resolve(__dirname, 'src/components/1-page/c-crud'),
      '@appbar': path.resolve(__dirname, 'src/components/1-page/b-navigation-mobx/aa-AppBar'),
      '@sidebar': path.resolve(__dirname, 'src/components/1-page/b-navigation-mobx/bb-Sidebar'),
      '@pageheader': path.resolve(__dirname, 'src/components/1-page/b-navigation-mobx/cc-PageHeader'),
      '@form': path.resolve(__dirname, 'src/components/2-form'),
      '@common': path.resolve(__dirname, 'src/components/3-common'),
      '@modal': path.resolve(__dirname, 'src/components/3-common/a-modal'),
      '@route': path.resolve(__dirname, 'src/routes'),
      '@login': path.resolve(__dirname, 'src/pages/0-Login'),
      '@dashboard': path.resolve(__dirname, 'src/pages/1-Dashboard'),
      '@ingredient': path.resolve(__dirname, 'src/pages/2-Ingredient'),
      '@product': path.resolve(__dirname, 'src/pages/3-Product'),
      '@account': path.resolve(__dirname, 'src/pages/4-Account'),
      '@mapping': path.resolve(__dirname, 'src/pages/5-Mapping'),
      '@entityHooks': path.resolve(__dirname, 'src/hooks/1-entity'),
      '@formHooks': path.resolve(__dirname, 'src/hooks/2-form'),
      '@entityServices': path.resolve(__dirname, 'src/services/1-entity'),
      '@apiServices': path.resolve(__dirname, 'src/services/2-api'),
      '@pageMapBuild': path.resolve(__dirname, 'src/utils/pageMapBuild'),
    }
  },
  
  // Ignore patterns for files that should be excluded from analysis
  ignorePatterns: [
    'node_modules/**/*',
    'build/**/*',
    'dist/**/*',
    'public/**/*',
    '**/*.test.js',
    '**/*.spec.js',
    '**/*.d.ts',
    'migration-tools/**/*'
  ],
  
  // Ignore certain packages from the "unused dependencies" list
  ignoreUnused: [
    'react', 
    'react-dom',
    '@testing-library/jest-dom', // Testing libs are often used in test files
    '@testing-library/react',
    '@testing-library/dom'
  ]
};
