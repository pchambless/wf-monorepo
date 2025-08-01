/**
 * Guidance Document Creation Workflow
 * Creates implementation guidance documents with automatic impact tracking
 * Domain-focused module for ADHD-friendly organization
 */

import { execCreateDoc } from "../../../api/index.js";
// Use browser-safe version for client compatibility
import { createPlanImpact } from "../shared/utils/createPlanImpact.browser.js";

/**
 * Create guidance document with impact tracking
 * @param {string|number} planId - Plan ID for directory structure
 * @param {string} component - Component/feature being guided
 * @param {string} content - Main guidance content
 * @param {Object} options - Additional options and metadata
 * @returns {Object} Creation result with success status and file details
 *
 * @example
 * const result = await createGuidance(19, 'modal-system', `
 * Implementation guidance for building the modal system...
 * `);
 *
 * if (result.success) {
 *   console.log('Guidance created:', result.filePath);
 * }
 */
export async function createGuidance(planId, component, content, options = {}) {
  try {
    // Create document using parameter-driven approach
    const docResult = await execCreateDoc({
      targetPath: ".kiro/:planId/guidance/",
      fileName: "implementation-guidance-:topic.md",
      template: "guidanceTemplate",
      planId,
      topic: component,
      content,
      docID: planId,
      agent: options.agent || "claude",
      requirements: options.requirements,
      steps: options.steps,
      integrationPoints: options.integrationPoints,
      testing: options.testing,
      security: options.security,
      performance: options.performance,
      deployment: options.deployment,
    });

    // Track impact if document creation succeeded
    if (docResult.success) {
      await createPlanImpact({
        planId,
        filePath: docResult.fullPath,
        changeType: "CREATE",
        phase: "guidance",
        description: `Created ${
          options.agent || "Claude"
        } guidance: ${component}`,
        agent: options.agent || "claude",
        metadata: {
          documentType: "guidance",
          component,
          template: "guidanceTemplate",
        },
      });
    }

    return {
      success: docResult.success,
      filePath: docResult.fullPath,
      fileName: docResult.resolvedFileName,
      planId,
      component,
      message: docResult.success
        ? `Guidance document created: ${docResult.resolvedFileName}`
        : docResult.message,
      error: docResult.error,
      code: docResult.code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Guidance document creation failed: ${error.message}`,
      code: "CREATION_ERROR",
    };
  }
}

export default createGuidance;
