/**
 * Config-Driven Workflow System Demo
 *
 * Demonstrates the integration between selectVals.json workflow documentation
 * and the WorkflowRegistry system
 */

import { workflowRegistry } from "../WorkflowRegistry.js";
import {
  getRegisteredWorkflows,
  getWorkflowDocumentation,
  validateWorkflowDocumentation,
  getWorkflowsByCategory,
  getWorkflowCategories,
} from "../../config/workflowConfig.js";

console.log("🚀 Config-Driven Workflow System Demo\n");

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

// 6. Auto-register workflows from config
console.log("\n🔄 6. Auto-Register Workflows from Config:");
const autoRegResult = workflowRegistry.autoRegisterFromConfig();
console.log(
  `   Auto-registered ${autoRegResult.registered} workflows out of ${autoRegResult.total} documented`
);

// 7. Show registry validation
console.log("\n🔍 7. Registry Validation:");
const validation = workflowRegistry.validateAllWorkflows();
console.log(`   Registered: ${validation.registered}`);
console.log(`   Documented: ${validation.documented}`);
console.log(`   Validated: ${validation.validated.length}`);
console.log(`   Undocumented: ${validation.undocumented.length}`);
console.log(`   Unregistered: ${validation.unregistered.length}`);

if (validation.undocumented.length > 0) {
  console.log("   Undocumented workflows:");
  validation.undocumented.forEach((w) => {
    console.log(`   - ${w.name}: ${w.errors.join(", ")}`);
  });
}

if (validation.unregistered.length > 0) {
  console.log("   Unregistered workflows:");
  validation.unregistered.forEach((name) => {
    console.log(`   - ${name}: Documented but not implemented`);
  });
}

// 8. Show documentation status
console.log("\n📊 8. Documentation Status:");
const statusList = workflowRegistry.getDocumentationStatus();
statusList.forEach((status) => {
  const regStatus = status.registered ? "✅" : "❌";
  const docStatus = status.documented ? "📋" : "❓";
  const placeholder = status.isPlaceholder ? " (placeholder)" : "";
  console.log(`   ${regStatus}${docStatus} ${status.name}${placeholder}`);
});

console.log("\n🎯 Config-Driven Workflow System Demo Complete!");
console.log("\nBenefits demonstrated:");
console.log("✅ Working documentation in selectVals.json");
console.log("✅ Automatic workflow validation");
console.log("✅ Config-driven timeouts and settings");
console.log("✅ Category-based workflow organization");
console.log("✅ Placeholder system for documented workflows");
console.log("✅ Developer tooling and discovery");
