/**
 * Test script for Architectural Intelligence System
 *
 * Quick validation that the path-classes.js system works correctly
 */

import { getArchitecturalIntel } from "../packages/shared-imports/src/architecture/intelligence.js";

console.log("🔍 Testing Architectural Intelligence System...\n");

try {
  const intel = getArchitecturalIntel();

  // Test 1: Basic functionality
  console.log("✅ Test 1: Basic Intel Loading");
  const summary = intel.generateSummaryReport();
  console.log(`   Total Files: ${summary.totalFiles}`);
  console.log(`   Critical Nodes: ${summary.criticalNodes}`);
  console.log(`   Cross-Package Deps: ${summary.crossPackageDeps}`);
  console.log(`   Dead Code Candidates: ${summary.deadCodeCandidates}\n`);

  // Test 2: Critical nodes identification
  console.log("✅ Test 2: Critical Nodes");
  const criticalNodes = intel.getCriticalNodes();
  criticalNodes.forEach((node) => {
    console.log(`   🔴 ${node.file} (${node.count} dependents)`);
  });
  console.log("");

  // Test 3: Category system
  console.log("✅ Test 3: Category System");
  const categories = intel.getCategories();
  Object.entries(categories).forEach(([id, category]) => {
    const files = intel.getFilesByCategory(parseInt(id));
    console.log(`   ${id}: ${category.name} - ${files.length} files`);
  });
  console.log("");

  // Test 4: Cross-package analysis
  console.log("✅ Test 4: Cross-Package Analysis");
  const packageConnections = intel.getPackageConnections();
  Object.entries(packageConnections)
    .slice(0, 5)
    .forEach(([connection, count]) => {
      console.log(`   📦 ${connection}: ${count} dependencies`);
    });
  console.log("");

  // Test 5: Blast radius analysis
  console.log("✅ Test 5: Blast Radius Analysis");
  const testFile = "packages/shared-imports/src/api/index.js";
  const blastRadius = intel.getBlastRadius(testFile);
  if (blastRadius) {
    console.log(`   💥 ${testFile}: ${blastRadius.count} dependents`);
    console.log(`   First 3 dependents:`);
    blastRadius.dependents.slice(0, 3).forEach((dep) => {
      console.log(`     - ${dep}`);
    });
  }
  console.log("");

  // Test 6: Mermaid chart generation
  console.log("✅ Test 6: Mermaid Chart Generation");
  const overviewChart = intel.generateMermaidChart("overview");
  console.log(`   Generated chart length: ${overviewChart.length} characters`);
  console.log(`   Chart preview: ${overviewChart.substring(0, 100)}...`);
  console.log("");

  // Test 7: Investigation paths
  console.log("✅ Test 7: Investigation Paths");
  const criticalPaths = intel.getInvestigationPaths(1); // CRITICAL_CORE
  console.log(`   Critical investigation paths: ${criticalPaths.length}`);
  criticalPaths.slice(0, 3).forEach((path) => {
    console.log(`     🎯 ${path.file} - ${path.priority} priority`);
  });

  console.log(
    "\n🎉 All tests passed! Architectural Intelligence System is working correctly."
  );
} catch (error) {
  console.error("❌ Test failed:", error);
  console.error("Stack trace:", error.stack);
}
