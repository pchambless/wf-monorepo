module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'auto' // Let Babel detect module type
    }],
    ['@babel/preset-react', {
      runtime: 'automatic' // Use new JSX transform
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs' // Force CommonJS for tests
        }]
      ]
    },
    development: {
      // Include packages in transpilation for development
      ignore: [
        function(filepath) {
          // Allow packages directory to be transpiled
          if (filepath.includes('/packages/')) {
            return false;
          }
          // Ignore node_modules except packages
          return filepath.includes('node_modules') && !filepath.includes('/packages/');
        }
      ]
    }
  }
};
