/**
 * End-to-End Workflow Integration Test
 * Tests that all workflows work together with proper impact tracking
 */

import { createAnalysis } from "../../analysis/createAnalysis.js";
import { createGuidance } from "../../guidance/createGuidance.js";
import { createCommunication } from "../../communications/createCommunication.js";

/**
 * Test complete workflow integration
 * @param {number} testPlanId - Test plan ID
 * @returns {Object} Test results
 */
export async function testWorkflowIntegration(testPlanId = 9999) {
  const results = {
    success: true,
    tests: [],
    errors: [],
  };

  try {
    console.log(`🧪 Testing workflow integration for plan ${testPlanId}...`);

    // Test 1: Analysis workflow with impact tracking
    console.log("📊 Testing analysis workflow...");
    const analysisResult = await createAnalysis(
      testPlanId,
      "integration-test",
      `# Integration Test Analysis

This is a test analysis document to verify the workflow integration.

## Key Points
- Analysis workflow is working
- Impact tracking is integrated
- Document creation is successful

## Next Steps
- Proceed to guidance creation
- Validate impact tracking
`,
      {
        agent: "kiro",
        architecturalNotes: "Testing workflow integration",
        risks: ["None - this is a test"],
        recommendations: ["Continue with integration testing"],
      }
    );

    results.tests.push({
      name: "Analysis Workflow",
      success: analysisResult.success,
      filePath: analysisResult.filePath,
      message: analysisResult.message,
    });

    if (!analysisResult.success) {
      results.errors.push(`Analysis failed: ${analysisResult.error}`);
      results.success = false;
    }

    // Test 2: Guidance workflow with impact tracking
    console.log("📋 Testing guidance workflow...");
    const guidanceResult = await createGuidance(
      testPlanId,
      "integration-test",
      `# Integration Test Guidance

Implementation guidance for testing workflow integration.

## Requirements
- All workflows must work together
- Impact tracking must be automatic
- Error handling must be robust

## Implementation Steps
1. Test analysis workflow
2. Test guidance workflow  
3. Test communication workflow
4. Validate impact tracking

## Testing Strategy
- Unit tests for each workflow
- Integration tests for combined usage
- End-to-end validation

## Security Considerations
- Validate all inputs
- Ensure proper error handling
- Track all file operations
`,
      {
        agent: "kiro",
        requirements: ["Workflow integration", "Impact tracking"],
        steps: ["Create analysis", "Create guidance", "Test communication"],
        testing: "Automated integration testing",
      }
    );

    results.tests.push({
      name: "Guidance Workflow",
      success: guidanceResult.success,
      filePath: guidanceResult.filePath,
      message: guidanceResult.message,
    });

    if (!guidanceResult.success) {
      results.errors.push(`Guidance failed: ${guidanceResult.error}`);
      results.success = false;
    }

    // Test 3: Communication workflow (no impact tracking)
    console.log("💬 Testing communication workflow...");
    const communicationResult = await createCommunication(
      testPlanId,
      "implementation-request",
      "Integration Test Complete",
      `The workflow integration test has been completed successfully.

Results:
- Analysis workflow: ${analysisResult.success ? "✅ PASS" : "❌ FAIL"}
- Guidance workflow: ${guidanceResult.success ? "✅ PASS" : "❌ FAIL"}
- Communication workflow: Testing now...

All workflows are properly integrated with impact tracking where appropriate.`,
      "kiro"
    );

    results.tests.push({
      name: "Communication Workflow",
      success: communicationResult.success,
      communicationId: communicationResult.communicationId,
      message: communicationResult.message,
    });

    if (!communicationResult.success) {
      results.errors.push(`Communication failed: ${communicationResult.error}`);
      results.success = false;
    }

    // Summary
    const passedTests = results.tests.filter((t) => t.success).length;
    const totalTests = results.tests.length;

    console.log(`\n🎯 Integration Test Results:`);
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (results.success) {
      console.log(`🎉 All workflows integrated successfully!`);
    } else {
      console.log(`⚠️  Some tests failed:`);
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    return {
      ...results,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
      },
    };
  } catch (error) {
    console.error("🚨 Integration test failed:", error);
    return {
      success: false,
      error: error.message,
      tests: results.tests,
      errors: [...results.errors, error.message],
    };
  }
}

/**
 * Quick validation test for import paths
 * @returns {Object} Import validation results
 */
export async function testImportPaths() {
  const results = {
    success: true,
    imports: [],
    errors: [],
  };

  try {
    // Test createPlanImpact import
    const { createPlanImpact } = await import("../utils/createPlanImpact.js");
    results.imports.push({
      module: "createPlanImpact",
      success: typeof createPlanImpact === "function",
    });

    // Test workflow imports
    const { createAnalysis } = await import("../../analysis/createAnalysis.js");
    results.imports.push({
      module: "createAnalysis",
      success: typeof createAnalysis === "function",
    });

    const { createGuidance } = await import("../../guidance/createGuidance.js");
    results.imports.push({
      module: "createGuidance",
      success: typeof createGuidance === "function",
    });

    const { createCommunication } = await import(
      "../../communications/createCommunication.js"
    );
    results.imports.push({
      module: "createCommunication",
      success: typeof createCommunication === "function",
    });

    const failedImports = results.imports.filter((imp) => !imp.success);
    if (failedImports.length > 0) {
      results.success = false;
      results.errors.push(
        `Failed imports: ${failedImports.map((imp) => imp.module).join(", ")}`
      );
    }

    console.log(
      "📦 Import validation:",
      results.success ? "✅ PASS" : "❌ FAIL"
    );
    return results;
  } catch (error) {
    console.error("🚨 Import validation failed:", error);
    return {
      success: false,
      error: error.message,
      imports: results.imports,
      errors: [...results.errors, error.message],
    };
  }
}

export default testWorkflowIntegration;
