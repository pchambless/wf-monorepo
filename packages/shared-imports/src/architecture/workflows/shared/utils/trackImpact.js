/**
 * Helper utility for easy impact tracking during development
 * Provides simple functions for common impact tracking scenarios
 */

import {
  createPlanImpact,
  createPlanImpactBatch,
} from "./createPlanImpact.browser.js";

/**
 * Track creation of a new file
 * @param {number} planId - Plan ID
 * @param {string} filePath - Path to created file
 * @param {string} description - What was created
 * @returns {Promise<Object>} Impact result
 */
export async function trackCreate(planId, filePath, description) {
  return await createPlanImpact({
    planId,
    filePath,
    changeType: "CREATE",
    description,
    agent: "kiro",
  });
}

/**
 * Track modification of an existing file
 * @param {number} planId - Plan ID
 * @param {string} filePath - Path to modified file
 * @param {string} description - What was changed
 * @returns {Promise<Object>} Impact result
 */
export async function trackModify(planId, filePath, description) {
  return await createPlanImpact({
    planId,
    filePath,
    changeType: "MODIFY",
    description,
    agent: "kiro",
  });
}

/**
 * Track deletion of a file
 * @param {number} planId - Plan ID
 * @param {string} filePath - Path to deleted file
 * @param {string} description - What was deleted
 * @returns {Promise<Object>} Impact result
 */
export async function trackDelete(planId, filePath, description) {
  return await createPlanImpact({
    planId,
    filePath,
    changeType: "DELETE",
    description,
    agent: "kiro",
  });
}

/**
 * Track moving/renaming a file
 * @param {number} planId - Plan ID
 * @param {string} oldPath - Original file path
 * @param {string} newPath - New file path
 * @param {string} description - What was moved/renamed
 * @returns {Promise<Object>} Impact result
 */
export async function trackMove(planId, oldPath, newPath, description) {
  return await createPlanImpact({
    planId,
    filePath: `${oldPath} → ${newPath}`,
    changeType: "MOVE",
    description,
    agent: "kiro",
  });
}

/**
 * Track multiple impacts at once
 * @param {number} planId - Plan ID
 * @param {Array<Object>} changes - Array of {type, path, description}
 * @returns {Promise<Object>} Batch result
 */
export async function trackBatch(planId, changes) {
  const impacts = changes.map((change) => ({
    planId,
    filePath: change.path,
    changeType: change.type.toUpperCase(),
    description: change.description,
    agent: "kiro",
  }));

  return await createPlanImpactBatch(impacts);
}

/**
 * Quick workflow impact tracking for common patterns
 */
export const workflowImpacts = {
  /**
   * Track creation of a new workflow file
   */
  async createWorkflow(planId, workflowName, features = []) {
    return await trackCreate(
      planId,
      `packages/shared-imports/src/architecture/workflows/${workflowName}.js`,
      `Created ${workflowName} workflow${
        features.length ? " with " + features.join(", ") : ""
      }`
    );
  },

  /**
   * Track adding export to index file
   */
  async addExport(planId, indexPath, exportName) {
    return await trackModify(
      planId,
      indexPath,
      `Added ${exportName} export to index`
    );
  },

  /**
   * Track creating test file
   */
  async createTest(planId, testPath, testSubject) {
    return await trackCreate(
      planId,
      testPath,
      `Created unit tests for ${testSubject}`
    );
  },

  /**
   * Track creating example/documentation
   */
  async createExample(planId, examplePath, exampleType) {
    return await trackCreate(
      planId,
      examplePath,
      `Created ${exampleType} examples and documentation`
    );
  },
};

/**
 * Development helper - logs impact results nicely
 * @param {Object} result - Impact tracking result
 * @param {string} action - What action was being tracked
 */
export function logImpactResult(result, action = "Impact") {
  if (result.success) {
    console.log(`✅ ${action} tracked successfully`);
    console.log(`   📋 Plan: ${result.planId}`);
    console.log(`   📁 File: ${result.filePath}`);
    console.log(`   🔄 Type: ${result.changeType}`);
    console.log(`   🆔 Impact ID: ${result.impactId}`);
  } else {
    console.log(`❌ ${action} tracking failed`);
    console.log(`   🚫 Error: ${result.error}`);
    console.log(`   📋 Plan: ${result.planId}`);
    console.log(`   📁 File: ${result.filePath}`);
  }
}

/**
 * Example usage patterns
 */
export const examples = {
  // Basic usage
  async basicExample() {
    const result = await trackCreate(
      29,
      "src/newFile.js",
      "Created new utility file"
    );
    logImpactResult(result, "File creation");
  },

  // Workflow creation pattern
  async workflowExample() {
    const planId = 29;

    // Track main workflow creation
    await workflowImpacts.createWorkflow(planId, "myWorkflow", [
      "validation",
      "error handling",
    ]);

    // Track adding exports
    await workflowImpacts.addExport(
      planId,
      "src/workflows/index.js",
      "myWorkflow"
    );
    await workflowImpacts.addExport(planId, "src/index.js", "myWorkflow");

    // Track tests and examples
    await workflowImpacts.createTest(
      planId,
      "src/__tests__/myWorkflow.test.js",
      "myWorkflow"
    );
    await workflowImpacts.createExample(
      planId,
      "src/examples/MyWorkflowExample.js",
      "usage"
    );
  },

  // Batch tracking pattern
  async batchExample() {
    const result = await trackBatch(29, [
      { type: "create", path: "src/file1.js", description: "Created file1" },
      { type: "modify", path: "src/file2.js", description: "Updated file2" },
      { type: "delete", path: "src/file3.js", description: "Removed file3" },
    ]);

    console.log(
      `📊 Batch result: ${result.successful}/${result.total} successful`
    );
  },
};

export default {
  trackCreate,
  trackModify,
  trackDelete,
  trackMove,
  trackBatch,
  workflowImpacts,
  logImpactResult,
  examples,
};
