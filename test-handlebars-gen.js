import { generateWorkflows } from "./analysis-n-document/genOps/workflows/genEntityWorkflows.js";

async function testHandlebarsGeneration() {
  try {
    console.log("🚀 Testing Handlebars-based genEntityWorkflows...");

    // Test with just one entity first
    const generator = await import(
      "./analysis-n-document/genOps/workflows/genEntityWorkflows.js"
    );
    const EntityWorkflowsGenerator = generator.EntityWorkflowsGenerator;

    const gen = new EntityWorkflowsGenerator();
    const result = await gen.generateEntityWorkflows(
      "./analysis-n-document/genOps/analyzeSchemas/apps/plans/plans.json",
      "plans"
    );

    console.log("\n📊 Single Entity Test Result:");
    console.log(`- ${result.entity}: ${result.success ? "✅" : "❌"}`);
    if (result.files) {
      result.files.forEach((file) => {
        console.log(`  📄 ${file.filename} (${file.size} bytes)`);
      });
    }
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testHandlebarsGeneration();
