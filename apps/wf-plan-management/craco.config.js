const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Basic monorepo configuration
      webpackConfig.resolve.symlinks = false;

      // Define shared-imports package path
      const sharedPackagePath = path.resolve(
        __dirname,
        "../../packages/shared-imports"
      );
      const nodeModulesSharedPath = path.resolve(
        __dirname,
        "node_modules/@whatsfresh/shared-imports"
      );

      // Add babel processing rule for shared-imports package
      const sharedPackageRule = {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          sharedPackagePath,
          nodeModulesSharedPath,
          // Also catch any path containing shared-imports
          (modulePath) => modulePath.includes("@whatsfresh/shared-imports"),
        ],
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [
              [
                require.resolve("@babel/preset-react"),
                {
                  runtime: "automatic",
                },
              ],
              [
                require.resolve("@babel/preset-env"),
                {
                  targets: "defaults",
                },
              ],
            ],
            plugins: [require.resolve("@babel/plugin-transform-runtime")],
            cacheDirectory: false,
            cacheCompression: false,
            babelrc: false,
            configFile: false,
          },
        },
      };

      // Add the babel rule for processing shared-imports package
      webpackConfig.module.rules.unshift(sharedPackageRule);

      return webpackConfig;
    },
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@config": path.resolve(__dirname, "src/config"),
    },
  },
};
