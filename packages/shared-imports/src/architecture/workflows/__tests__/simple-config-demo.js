/**
 * Simple Config-Driven Workflow Demo
 *
 * Demonstrates the workflow documentation system from selectVals.json
 * without importing the full workflow registry
 */

import {
  getRegisteredWorkflows,
  getWorkflowDocumentation,
  validateWorkflowDocumentation,
  getWorkflowsByCategory,
  getWorkflowCategories,
} from "../../config/workflowConfig.js";

console.log("🚀 Simple Config-Driven Workflow Demo\n");

// 1. Show workflow documentation from config
console.log("📋 1. Workflow Documentation from Config:");
const workflows = getRegisteredWorkflows();
console.log(`   Found ${workflows.length} documented workflows:`);
workflows.forEach((w) => {
  console.log(
    `   - ${w.value}: ${w.description} (${w.category}, ${w.timeout}ms)`
  );
});

// 2. Show specific workflow documentation
console.log("\n📖 2. Specific Workflow Documentation:");
const createPlanDoc = getWorkflowDocumentation("createPlan");
if (createPlanDoc) {
  console.log(`   Workflow: ${createPlanDoc.name}`);
  console.log(`   Category: ${createPlanDoc.category}`);
  console.log(`   Timeout: ${createPlanDoc.timeout}ms`);
  console.log(`   Steps: ${createPlanDoc.steps.join(", ")}`);
  console.log(`   Context Refresh: ${createPlanDoc.contextRefresh.join(", ")}`);
  console.log(`   Error Handling: ${createPlanDoc.errorHandling}`);
  console.log(`   Retryable: ${createPlanDoc.retryable}`);
}

// 3. Show workflow categories
console.log("\n🏷️  3. Workflow Categories:");
const categories = getWorkflowCategories();
categories.forEach((cat) => {
  console.log(`   - ${cat.value}: ${cat.description} (${cat.color})`);
});

// 4. Show workflows by category
console.log("\n📂 4. Workflows by Category:");
const planWorkflows = getWorkflowsByCategory("plan-operations");
console.log(`   Plan Operations (${planWorkflows.length} workflows):`);
planWorkflows.forEach((w) => {
  console.log(`   - ${w.value}: ${w.description}`);
});

// 5. Validate workflow documentation
console.log("\n✅ 5. Workflow Documentation Validation:");
const testWorkflows = [
  "createPlan",
  "updatePlan",
  "archivePlan",
  "nonExistentWorkflow",
];
testWorkflows.forEach((workflowName) => {
  const validation = validateWorkflowDocumentation(workflowName);
  const status = validation.valid ? "✅ VALID" : "❌ INVALID";
  console.log(`   ${workflowName}: ${status}`);
  if (!validation.valid) {
    validation.errors.forEach((error) => console.log(`     Error: ${error}`));
  }
  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) =>
      console.log(`     Warning: ${warning}`)
    );
  }
});

console.log("\n🎯 Config-Driven Workflow System Benefits:");
console.log("✅ Working documentation in selectVals.json");
console.log("✅ Automatic workflow validation");
console.log("✅ Config-driven timeouts and settings");
console.log("✅ Category-based workflow organization");
console.log("✅ Developer tooling and discovery");
console.log("✅ Single source of truth for workflow metadata");

console.log("\n📊 Summary:");
console.log(`   Total documented workflows: ${workflows.length}`);
console.log(`   Total categories: ${categories.length}`);
console.log(`   Plan operations: ${planWorkflows.length} workflows`);
console.log(
  `   Communication workflows: ${
    getWorkflowsByCategory("communication").length
  } workflows`
);
console.log(
  `   Impact tracking workflows: ${
    getWorkflowsByCategory("impact-tracking").length
  } workflows`
);

console.log("\n🎉 Config-driven workflow documentation system is working!");
