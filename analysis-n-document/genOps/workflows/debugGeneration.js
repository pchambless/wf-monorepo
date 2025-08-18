/**
 * Debug script for entity generation
 */

import { EntityWorkflowsGenerator } from "./genEntityWorkflows.js";

async function debugGeneration() {
  console.log("🔍 Debug: Testing single entity generation...");

  try {
    const generator = new EntityWorkflowsGenerator();

    const plansEntityPath =
      "./analysis-n-document/genOps/analyzeSchemas/apps/plans/plans.json";
    console.log(`📂 Loading entity from: ${plansEntityPath}`);

    const result = await generator.generateEntityWorkflows(
      plansEntityPath,
      "plans"
    );

    console.log("📊 Generation Result:");
    console.log("Success:", result.success);
    console.log("Entity:", result.entity);
    console.log("Files generated:", result.files?.length || 0);

    if (result.files) {
      result.files.forEach((file) => {
        console.log(
          `  - ${file.filename} (${file.size} bytes) at ${file.path}`
        );
      });
    }

    if (result.error) {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugGeneration();
