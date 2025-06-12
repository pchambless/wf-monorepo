module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'auto' // Let Babel detect module type
    }],
    '@babel/preset-react'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs' // Force CommonJS for tests
        }]
      ]
    }
  }
};
