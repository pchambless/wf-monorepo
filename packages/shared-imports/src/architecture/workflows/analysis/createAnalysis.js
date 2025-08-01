/**
 * Analysis Document Creation Workflow
 * Creates analysis documents with automatic impact tracking
 * Domain-focused module for ADHD-friendly organization
 */

import { execCreateDoc } from "../../../api/index.js";
// Use browser-safe version for client compatibility
import { createPlanImpact } from "../shared/utils/createPlanImpact.browser.js";

/**
 * Create analysis document with impact tracking
 * @param {string|number} planId - Plan ID for directory structure
 * @param {string} topic - Analysis topic/subject
 * @param {string} content - Main analysis content
 * @param {Object} options - Additional options and metadata
 * @returns {Object} Creation result with success status and file details
 *
 * @example
 * const result = await createAnalysis(19, 'feature-analysis', `
 * This analysis covers the architectural approach for the new feature...
 * `);
 *
 * if (result.success) {
 *   console.log('Analysis created:', result.filePath);
 * }
 */
export async function createAnalysis(planId, topic, content, options = {}) {
  try {
    // Create document using parameter-driven approach
    const docResult = await execCreateDoc({
      targetPath: ".kiro/:planId/analysis/",
      fileName: ":agent-analysis-:topic.md",
      template: "analysisTemplate",
      planId,
      topic,
      content,
      docID: planId,
      agent: options.agent || "claude",
      architecturalNotes: options.architecturalNotes,
      risks: options.risks,
      integrationPoints: options.integrationPoints,
      recommendations: options.recommendations,
    });

    // Track impact if document creation succeeded
    if (docResult.success) {
      await createPlanImpact({
        planId,
        filePath: docResult.fullPath,
        changeType: "CREATE",
        phase: "analysis",
        description: `Created ${options.agent || "Claude"} analysis: ${topic}`,
        agent: options.agent || "claude",
        metadata: {
          documentType: "analysis",
          topic,
          template: "analysisTemplate",
        },
      });
    }

    return {
      success: docResult.success,
      filePath: docResult.fullPath,
      fileName: docResult.resolvedFileName,
      planId,
      topic,
      message: docResult.success
        ? `Analysis document created: ${docResult.resolvedFileName}`
        : docResult.message,
      error: docResult.error,
      code: docResult.code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Analysis document creation failed: ${error.message}`,
      code: "CREATION_ERROR",
    };
  }
}

export default createAnalysis;
