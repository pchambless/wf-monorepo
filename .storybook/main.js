const path = require('path');

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: [
    '../apps/wf-client/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    // Ensure JSX files are processed by Babel
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
        },
      },
    });

    // Add aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@whatsfresh/shared-config': path.resolve(__dirname, '../packages/shared-config'),
      '@whatsfresh/wf-client': path.resolve(__dirname, '../apps/wf-client/src'),
      '@whatsfresh/tools': path.resolve(__dirname, '../tools'),
    };
    
    return config;
  },
};

export default config;