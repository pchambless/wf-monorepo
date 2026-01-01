/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: {
      path: 'node_modules|\\.next|dist|build|coverage'
    },
    includeOnly: {
      path: ['^(apps|packages)/']
    },
    // Exclude problematic files that break parsing
    exclude: {
      path: [
        'apps/wf-client/src/stores/accountStore.jsx',
        'apps/wf-client/src/actions/tracker/components/Presenter.jsx'
        // Add more problematic files here as you find them
      ]
    },
    // Improve parser configuration
    tsPreCompilationDeps: true, // Try enabling this to handle JSX better
    enhancedResolveOptions: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs'],
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"]
    },
    // Add parser options
    exoticRequireStrings: [
      "require",
      "proxyquire",
      "import",
      "fromImage"
    ],
    // Fix the reporterOptions structure
    reporterOptions: {
      dot: {
        theme: {
          graph: {
            rankdir: "LR"
          }
        }
      },
      archi: {
        collapsePattern: "node_modules/[^/]+",
        theme: {
          graph: {
            splines: "ortho"
          }
        }
      }
    }
  }
};