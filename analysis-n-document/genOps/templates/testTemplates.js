/**
 * Template Testing Script
 *
 * Tests the dual-zone templates with actual entity data
 */

import { templateProcessor, generateContext } from "./shared/templateUtils.js";
import fs from "fs/promises";
import path from "path";

async function testTemplates() {
  try {
    console.log("🧪 Testing dual-zone templates...\n");

    // Load the plans entity data
    const plansJsonPath = path.resolve(
      "./analysis-n-document/genOps/analyzeSchemas/apps/plans/plans.json"
    );
    const plansData = JSON.parse(await fs.readFile(plansJsonPath, "utf-8"));

    console.log(`📊 Loaded entity data for: ${plansData.name}`);
    console.log(`📋 Fields: ${plansData.fields.length}`);
    console.log(`🔑 Primary key: ${plansData.primaryKey}\n`);

    // Generate template context
    const context = generateContext(plansData, {
      schemaSource: plansJsonPath,
      additionalContext: {
        // Add any additional context for testing
      },
    });

    console.log("🎯 Generated template context:");
    console.log(`   Entity: ${context.entityName} (${context.EntityName})`);
    console.log(`   Table: ${context.tableName}`);
    console.log(`   Primary Key: ${context.primaryKey}`);
    console.log(`   Fields: ${context.fields.length}\n`);

    // Test workflow template
    console.log("🔧 Processing workflow template...");
    const workflowTemplate = await fs.readFile(
      path.resolve(
        "./analysis-n-document/genOps/templates/workflow/Template.js"
      ),
      "utf-8"
    );
    const processedWorkflow = templateProcessor.processTemplate(
      workflowTemplate,
      context
    );

    // Write test output
    await fs.writeFile("./test-output-workflow.js", processedWorkflow);
    console.log("✅ Workflow template processed → test-output-workflow.js\n");

    // Test display template
    console.log("🎨 Processing display template...");
    const displayTemplate = await fs.readFile(
      path.resolve(
        "./analysis-n-document/genOps/templates/workflow/displayTemplate.js"
      ),
      "utf-8"
    );
    const processedDisplay = templateProcessor.processTemplate(
      displayTemplate,
      context
    );

    // Write test output
    await fs.writeFile("./test-output-display.js", processedDisplay);
    console.log("✅ Display template processed → test-output-display.js\n");

    // Validate output
    console.log("🔍 Validation results:");

    // Check if key substitutions worked
    const workflowHasEntityName = processedWorkflow.includes("plansWorkflow");
    const displayHasFields =
      processedDisplay.includes("id:") && processedDisplay.includes("cluster:");
    const hasManualZones =
      processedWorkflow.includes("MANUAL CUSTOMIZATION ZONE") &&
      processedDisplay.includes("MANUAL CUSTOMIZATION ZONE");

    console.log(
      `   ✅ Entity name substitution: ${
        workflowHasEntityName ? "PASS" : "FAIL"
      }`
    );
    console.log(
      `   ✅ Field generation: ${displayHasFields ? "PASS" : "FAIL"}`
    );
    console.log(
      `   ✅ Manual zones preserved: ${hasManualZones ? "PASS" : "FAIL"}`
    );

    if (workflowHasEntityName && displayHasFields && hasManualZones) {
      console.log("\n🎉 All template tests PASSED!");
      console.log("📁 Check test-output-*.js files to review generated code");
    } else {
      console.log("\n❌ Some template tests FAILED - check output files");
    }
  } catch (error) {
    console.error("❌ Template test failed:", error);
    process.exit(1);
  }
}

// Run the test
testTemplates();
