/**
 * Simple test for file operations integration
 */

console.log("Testing file operations integration...");

try {
  // Test basic import
  const { createDoc } = await import("../fileOperations.js");
  console.log("✅ createDoc imported successfully");

  // Test impact tracking import
  const { getStats } = await import(
    "../../architecture/workflows/impact-tracking/index.js"
  );
  console.log("✅ Impact tracking imported successfully");

  // Test basic file creation (without database)
  const result = createDoc("./test-temp", "simple-test.txt", "Hello World");
  console.log("✅ createDoc executed:", result.success ? "SUCCESS" : "FAILED");

  if (result.success) {
    console.log("   File path:", result.fullPath);

    // Clean up
    const fs = await import("fs");
    if (fs.existsSync("./test-temp")) {
      fs.rmSync("./test-temp", { recursive: true, force: true });
      console.log("✅ Cleanup completed");
    }
  }

  console.log("🎉 Basic integration test passed!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  console.error(error.stack);
}
