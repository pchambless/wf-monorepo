/**
 * Complete Plan Workflow Usage Example
 * Demonstrates how to use the completePlan workflow
 */

import { completePlan } from "../../plans/completePlan.js";

/**
 * Example: Complete a plan with basic information
 */
export async function basicPlanCompletion() {
  console.log("🎯 Example: Basic Plan Completion");

  const result = await completePlan(
    {
      planId: 29,
      completionNotes: "Plan completed successfully with all objectives met.",
      completionStatus: "completed",
    },
    "kiro"
  );

  if (result.success) {
    console.log("✅ Plan completed successfully!");
    console.log(`📋 Plan ID: ${result.paddedPlanId}`);
    console.log(`📝 Status: ${result.completionStatus}`);
    console.log(`📄 Document: ${result.documentPath}`);
    console.log(`💬 Message: ${result.message}`);
  } else {
    console.log("❌ Plan completion failed:");
    console.log(`🚫 Error: ${result.message}`);
  }

  return result;
}

/**
 * Example: Complete a plan with detailed notes
 */
export async function detailedPlanCompletion() {
  console.log("🎯 Example: Detailed Plan Completion");

  const detailedNotes = `
# Plan Completion Summary

## Objectives Achieved
- ✅ Created completePlan.js workflow
- ✅ Added proper exports to all index files
- ✅ Implemented impact tracking integration
- ✅ Created unit tests and examples
- ✅ Updated main shared-imports exports

## Key Features Implemented
- Database plan status updates
- Completion timestamp tracking
- Automatic completion document generation
- Impact tracking for audit trail
- Comprehensive error handling

## Testing Results
- Unit tests: All passing
- Import/export validation: Successful
- Workflow integration: Complete

## Next Steps
- Connect UI completion button to this workflow
- Test with actual plan completion in UI
- Validate impact tracking works end-to-end
`;

  const result = await completePlan(
    {
      planId: 29,
      completionNotes: detailedNotes.trim(),
      completionStatus: "completed",
    },
    "kiro"
  );

  if (result.success) {
    console.log("✅ Detailed plan completion successful!");
    console.log(`📊 Details:`, result.details);
  } else {
    console.log("❌ Detailed plan completion failed:");
    console.log(`🚫 Error: ${result.error}`);
  }

  return result;
}

/**
 * Example: Complete a plan with custom status
 */
export async function customStatusCompletion() {
  console.log("🎯 Example: Custom Status Completion");

  const result = await completePlan(
    {
      planId: 29,
      completionNotes:
        "Plan completed with some minor items deferred to future plans.",
      completionStatus: "completed-with-deferrals",
    },
    "kiro"
  );

  if (result.success) {
    console.log("✅ Custom status completion successful!");
    console.log(`🏷️  Custom Status: ${result.completionStatus}`);
  } else {
    console.log("❌ Custom status completion failed:");
    console.log(`🚫 Error: ${result.message}`);
  }

  return result;
}

/**
 * Example: Error handling for invalid plan
 */
export async function errorHandlingExample() {
  console.log("🎯 Example: Error Handling");

  // Try to complete a non-existent plan
  const result = await completePlan(
    {
      planId: 99999,
      completionNotes: "This should fail",
      completionStatus: "completed",
    },
    "kiro"
  );

  if (!result.success) {
    console.log("✅ Error handling working correctly:");
    console.log(`🚫 Expected Error: ${result.message}`);
    console.log(`🏷️  Error Code: ${result.error}`);
  } else {
    console.log("❌ Unexpected success - error handling may not be working");
  }

  return result;
}

/**
 * Example: Batch completion validation
 */
export async function batchCompletionExample() {
  console.log("🎯 Example: Batch Completion Validation");

  const plansToComplete = [
    {
      planId: 19,
      notes: "Document Automation System completed",
      status: "completed",
    },
    {
      planId: 29,
      notes: "completePlan workflow implemented",
      status: "completed",
    },
  ];

  const results = [];

  for (const plan of plansToComplete) {
    console.log(`📋 Completing Plan ${plan.planId}...`);

    const result = await completePlan(
      {
        planId: plan.planId,
        completionNotes: plan.notes,
        completionStatus: plan.status,
      },
      "kiro"
    );

    results.push({
      planId: plan.planId,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      console.log(`✅ Plan ${plan.planId} completed successfully`);
    } else {
      console.log(
        `❌ Plan ${plan.planId} completion failed: ${result.message}`
      );
    }
  }

  const successful = results.filter((r) => r.success).length;
  const total = results.length;

  console.log(`📊 Batch Completion Results: ${successful}/${total} successful`);

  return results;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log("🚀 Running Complete Plan Workflow Examples\n");

  try {
    await basicPlanCompletion();
    console.log("\n" + "=".repeat(50) + "\n");

    await detailedPlanCompletion();
    console.log("\n" + "=".repeat(50) + "\n");

    await customStatusCompletion();
    console.log("\n" + "=".repeat(50) + "\n");

    await errorHandlingExample();
    console.log("\n" + "=".repeat(50) + "\n");

    await batchCompletionExample();

    console.log("\n🎉 All examples completed!");
  } catch (error) {
    console.error("🚨 Example execution failed:", error.message);
  }
}

// Export individual examples
export default {
  basicPlanCompletion,
  detailedPlanCompletion,
  customStatusCompletion,
  errorHandlingExample,
  batchCompletionExample,
  runAllExamples,
};
