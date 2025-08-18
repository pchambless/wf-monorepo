import { generateWorkflows } from "./analysis-n-document/genOps/workflows/genEntityWorkflows.js";

async function testGeneration() {
  try {
    console.log("🚀 Testing genEntityWorkflows for plans app...");
    const results = await generateWorkflows("plans");

    console.log("\n📊 Generation Results:");
    results.forEach((result) => {
      console.log(`- ${result.entity}: ${result.success ? "✅" : "❌"}`);
      if (result.files) {
        result.files.forEach((file) =>
          console.log(`  📄 ${file.filename} (${file.size} bytes)`)
        );
      }
      if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      }
    });

    const successful = results.filter((r) => r.success).length;
    console.log(
      `\n🎉 Successfully generated ${successful}/${results.length} entities`
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testGeneration();
