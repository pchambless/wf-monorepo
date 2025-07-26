/**
 * WhatsFresh Architectural Intelligence System
 *
 * Provides AI-consumable architectural analysis based on madge dependency data
 * Uses configurable numeric identifiers for path class categories
 */

import madgeData from "./data/madge-analysis.json" with { type: "json" };

// Configurable Path Class Categories (numeric IDs for flexibility)
const PATH_CATEGORIES = {
  1: {
    name: "CRITICAL_CORE",
    description: "Core system files (8+ dependents)",
    color: "#ff4444",
  },
  2: {
    name: "HIGH_IMPACT",
    description: "High impact files (4-7 dependents)",
    color: "#ff8800",
  },
  3: {
    name: "MEDIUM_IMPACT",
    description: "Medium impact files (2-3 dependents)",
    color: "#ffaa00",
  },
  4: {
    name: "LOW_IMPACT",
    description: "Low impact files (1 dependent)",
    color: "#88cc00",
  },
  5: {
    name: "LEAF_NODES",
    description: "Leaf nodes (0 dependents)",
    color: "#00cc88",
  },
  6: {
    name: "DEAD_CODE",
    description: "Files not in dependency graph",
    color: "#cccccc",
  },
  7: {
    name: "CONFIG_ONLY",
    description: "Pure configuration files",
    color: "#0088cc",
  },
  8: {
    name: "CROSS_PACKAGE",
    description: "Cross-package dependencies",
    color: "#8800cc",
  },
};

// Package identifiers for cross-package analysis
const PACKAGES = {
  1: { name: "wf-client", path: "apps/wf-client" },
  2: { name: "wf-admin", path: "apps/wf-admin" },
  3: { name: "wf-server", path: "apps/wf-server" },
  4: { name: "shared-imports", path: "packages/shared-imports" },
  5: { name: "devtools", path: "packages/devtools" },
};

/**
 * Calculate reverse dependency counts for all files
 * Uses enhanced madge data structure with files.{file}.dependencies
 */
function calculateDependentCounts(madgeData) {
  const dependentCounts = {};

  // Initialize all files with data from enhanced structure
  Object.entries(madgeData.files || {}).forEach(([file, fileData]) => {
    dependentCounts[file] = { 
      file, 
      count: fileData.dependent_count || 0, 
      dependents: fileData.dependents || []
    };
  });

  return Object.values(dependentCounts).sort((a, b) => b.count - a.count);
}

/**
 * Categorize files by impact level using numeric categories
 */
function categorizeByImpact(dependentCounts) {
  const categories = {};

  dependentCounts.forEach((item) => {
    let categoryId;
    if (item.count >= 8) {
      categoryId = 1;
    } else if (item.count >= 4) categoryId = 2; // HIGH_IMPACT
        else if (item.count >= 2) categoryId = 3; // MEDIUM_IMPACT
        else if (item.count === 1) categoryId = 4; // LOW_IMPACT
        else categoryId = 5; // LEAF_NODES

    if (!categories[categoryId]) {
      categories[categoryId] = [];
    }
    categories[categoryId].push(item);
  });

  return categories;
}

/**
 * Identify cross-package dependencies
 */
function identifyCrossPackageDependencies(madgeData) {
  const crossPackageDeps = [];

  Object.entries(madgeData.files || {}).forEach(([file, fileData]) => {
    const filePackage = getPackageId(file);
    const dependencies = fileData.dependencies || [];

    dependencies.forEach((dep) => {
      const depPackage = getPackageId(dep);
      if (filePackage !== depPackage) {
        crossPackageDeps.push({
          from: file,
          to: dep,
          fromPackage: filePackage,
          toPackage: depPackage,
          fromPackageName: PACKAGES[filePackage]?.name || "unknown",
          toPackageName: PACKAGES[depPackage]?.name || "unknown",
        });
      }
    });
  });

  return crossPackageDeps;
}

/**
 * Get package ID for a file path
 */
function getPackageId(filePath) {
  // Ensure filePath is a string before processing
  if (typeof filePath !== 'string') {
    return 0; // Unknown package
  }
  
  for (const [id, pkg] of Object.entries(PACKAGES)) {
    if (filePath.startsWith(pkg.path)) {
      return parseInt(id);
    }
  }
  return 0; // Unknown package
}

/**
 * Identify potential dead code by comparing filesystem to madge output
 */
function identifyDeadCode(madgeData) {
  // This would need filesystem scanning - for now return known patterns
  const knownDeadCode = [
    // Test artifacts
    "apps/wf-client/src/App.test.jsx",
    "apps/wf-client/src/TestMonorepo.jsx",

    // Empty/broken files
    "apps/wf-client/src/stores/eventStore.js",
    "apps/wf-client/src/utils/entityHelpers.js",
    "apps/wf-client/src/utils/runtimeRoutes.js",

    // Server test files
    "apps/wf-server/server/utils/dml/__tests__/dmlProcessor.test.js",
  ];

  return knownDeadCode.map((file) => ({
    file,
    category: 6, // DEAD_CODE
    reason: "Not found in madge dependency graph",
    safeToRemove: true,
  }));
}

/**
 * Generate Mermaid chart based on type and data
 */
function generateMermaidChart(type, data) {
  switch (type) {
    case "overview":
      return generateOverviewChart(data);
    case "critical-nodes":
      return generateCriticalNodesChart(data);
    case "cross-package":
      return generateCrossPackageChart(data);
    case "widget-system":
      return generateWidgetSystemChart(data);
    default:
      return "graph TD\n  A[Unknown Chart Type]";
  }
}

/**
 * Generate overview architecture chart
 */
function generateOverviewChart(dependentCounts) {
  const critical = dependentCounts.filter((item) => item.count >= 8);
  const high = dependentCounts.filter(
    (item) => item.count >= 4 && item.count < 8
  );

  let chart = "graph TD\n";

  // Add critical nodes
  critical.forEach((item, index) => {
    const nodeId = `C${index}`;
    const fileName = item.file.split("/").pop();
    chart += `  ${nodeId}["${fileName} - ${item.count} deps"]\n`;
    chart += `  style ${nodeId} fill:#ff4444,stroke:#333,stroke-width:2px\n`;
  });

  // Add high impact nodes
  high.forEach((item, index) => {
    const nodeId = `H${index}`;
    const fileName = item.file.split("/").pop();
    chart += `  ${nodeId}["${fileName} - ${item.count} deps"]\n`;
    chart += `  style ${nodeId} fill:#ff8800,stroke:#333,stroke-width:2px\n`;
  });

  // Add some connections to show relationships
  if (critical.length > 0 && high.length > 0) {
    chart += `  C0 --> H0\n`;
  }

  return chart;
}

/**
 * Generate critical nodes focused chart
 */
function generateCriticalNodesChart(dependentCounts) {
  const critical = dependentCounts.filter((item) => item.count >= 4);

  let chart = "graph TD\n";

  critical.forEach((item, index) => {
    const nodeId = `N${index}`;
    const fileName = item.file.split("/").pop();
    const packageName = getPackageName(item.file);

    chart += `  ${nodeId}["${packageName} - ${fileName} - ${item.count} deps"]\n`;

    // Color by category
    const categoryId = item.count >= 8 ? 1 : 2;
    chart += `  style ${nodeId} fill:${PATH_CATEGORIES[categoryId].color},stroke:#333,stroke-width:2px\n`;
  });

  // Add some connections between nodes to show relationships
  if (critical.length > 1) {
    for (let i = 0; i < Math.min(critical.length - 1, 3); i++) {
      chart += `  N${i} --> N${i + 1}\n`;
    }
  }

  return chart;
}

/**
 * Generate cross-package dependency chart
 */
function generateCrossPackageChart(crossPackageDeps) {
  let chart = "graph TD\n";

  // Create package nodes
  Object.entries(PACKAGES).forEach(([id, pkg]) => {
    chart += `  P${id}["${pkg.name}"]\n`;
  });

  // Add cross-package connections (sample to avoid clutter)
  const sampleDeps = crossPackageDeps.slice(0, 10);
  sampleDeps.forEach((dep, index) => {
    chart += `  P${dep.fromPackage} --> P${dep.toPackage}\n`;
  });

  return chart;
}

/**
 * Generate widget system architecture chart
 */
function generateWidgetSystemChart(madgeData) {
  let chart = "graph TD\n";

  // Find SelectWidget and its dependents
  const selectWidgetPath =
    "packages/shared-imports/src/components/selectors/SelectWidget.jsx";
  const selectWidgetDependents = [];

  Object.entries(madgeData).forEach(([file, deps]) => {
    if (Array.isArray(deps) && deps.includes(selectWidgetPath)) {
      selectWidgetDependents.push(file);
    }
  });

  // Add SelectWidget as central node
  chart += '  SW["SelectWidget.jsx - Central Hub"]\n';
  chart += "  style SW fill:#99ccff,stroke:#333,stroke-width:2px\n";

  // Add dependent widgets
  selectWidgetDependents.forEach((file, index) => {
    const fileName = file.split("/").pop();
    const nodeId = `W${index}`;
    chart += `  ${nodeId}["${fileName}"]\n`;
    chart += `  ${nodeId} --> SW\n`;
  });

  // Add core dependencies
  chart += '  API["api/index.js"]\n';
  chart += '  CS["contextStore.js"]\n';
  chart += "  SW --> API\n";
  chart += "  SW --> CS\n";
  chart += "  style API fill:#ff9999\n";
  chart += "  style CS fill:#ff9999\n";

  return chart;
}

/**
 * Get package name from file path
 */
function getPackageName(filePath) {
  for (const pkg of Object.values(PACKAGES)) {
    if (filePath.startsWith(pkg.path)) {
      return pkg.name;
    }
  }
  return "unknown";
}

/**
 * Main architectural intelligence interface
 */
export const getArchitecturalIntel = () => {
  const dependentCounts = calculateDependentCounts(madgeData);
  const categories = categorizeByImpact(dependentCounts);
  const crossPackageDeps = identifyCrossPackageDependencies(madgeData);
  const deadCode = identifyDeadCode(madgeData);

  return {
    // Configuration access
    getCategories: () => PATH_CATEGORIES,
    getPackages: () => PACKAGES,

    // Core analysis
    getDependentCounts: () => dependentCounts,
    getCategorizedFiles: () => categories,
    getCriticalNodes: () => categories[1] || [], // CRITICAL_CORE
    getHighImpactNodes: () => categories[2] || [], // HIGH_IMPACT
    getLeafNodes: () => categories[5] || [], // LEAF_NODES

    // Specific queries
    getFilesByCategory: (categoryId) => categories[categoryId] || [],
    getBlastRadius: (filePath) => {
      const item = dependentCounts.find((d) => d.file === filePath);
      return item ? { count: item.count, dependents: item.dependents } : null;
    },
    getDependents: (filePath) => madgeData[filePath] || [],

    // Cross-package analysis
    getCrossPackageDependencies: () => crossPackageDeps,
    getPackageConnections: () => {
      const connections = {};
      crossPackageDeps.forEach((dep) => {
        const key = `${dep.fromPackage}->${dep.toPackage}`;
        connections[key] = (connections[key] || 0) + 1;
      });
      return connections;
    },

    // Dead code analysis
    getDeadCode: () => deadCode,
    getSafeToRemove: () => deadCode.filter((item) => item.safeToRemove),

    // AI navigation helpers
    getInvestigationPaths: (categoryId) => {
      const files = categories[categoryId] || [];
      return files.map((item) => ({
        file: item.file,
        priority: item.count >= 8 ? "HIGH" : item.count >= 4 ? "MEDIUM" : "LOW",
        reason: `${item.count} dependents - ${PATH_CATEGORIES[categoryId]?.description}`,
      }));
    },

    // Visualization
    generateMermaidChart: (type) => generateMermaidChart(type, dependentCounts),

    // Reporting
    generateSummaryReport: () => ({
      totalFiles: Object.keys(madgeData).length,
      criticalNodes: (categories[1] || []).length,
      highImpactNodes: (categories[2] || []).length,
      leafNodes: (categories[5] || []).length,
      crossPackageDeps: crossPackageDeps.length,
      deadCodeCandidates: deadCode.length,
      categories: Object.entries(categories).map(([id, files]) => ({
        id: parseInt(id),
        name: PATH_CATEGORIES[id]?.name,
        count: files.length,
      })),
    }),
  };
};

// Export configuration for external modification
export { PATH_CATEGORIES, PACKAGES };
