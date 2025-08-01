/**
 * Document Creation Workflow Helper
 * Unified utility for creating documents with co-located templates
 * Handles execCreateDoc API calls and automatic impact tracking
 */

// Use simple file writing instead of complex execCreateDoc
const writeFileDirectly = async (filePath, content) => {
  const response = await fetch('http://localhost:3001/api/writeFileDirectly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, content })
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};
import { createPlanImpact } from "./createPlanImpact.js";

/**
 * Create a document using local template content and track impact
 * @param {Object} params - Document creation parameters
 * @param {string} params.targetPath - Target directory path
 * @param {string} params.fileName - File name
 * @param {Function} params.template - Template function to generate content
 * @param {Object} params.templateParams - Parameters to pass to template
 * @param {string|number} [params.planId] - Plan ID for impact tracking
 * @param {string} [params.agent] - Agent creating document (claude, kiro, user)
 * @param {string} [params.description] - Custom description for impact tracking
 * @returns {Promise<Object>} Document creation result with impact tracking
 * 
 * @example
 * // Create plan document
 * import { planTemplate } from '../plans/Template.js';
 * 
 * const result = await createDoc({
 *   targetPath: 'claude-plans/a-pending',
 *   fileName: '0030-My-Plan.md',
 *   template: planTemplate,
 *   templateParams: { planId: '0030', planData: {...} },
 *   planId: 30,
 *   agent: 'claude',
 *   description: 'Created plan document via workflow'
 * });
 */
export async function createDoc({
  targetPath,
  fileName,
  template,
  templateParams,
  planId = null,
  agent = 'system',
  description = null
}) {
  try {
    // Validate required parameters
    if (!targetPath || !fileName || !template || !templateParams) {
      throw new Error(
        "Missing required parameters: targetPath, fileName, template, templateParams"
      );
    }

    // Generate document content using local template
    let documentContent;
    try {
      documentContent = template(templateParams);
    } catch (templateError) {
      throw new Error(`Template generation failed: ${templateError.message}`);
    }

    // Create document using simple writeFileDirectly
    const fullPath = `${targetPath}/${fileName}`;
    const docResult = await writeFileDirectly(fullPath, documentContent);

    // Track impact if planId provided
    let impactResult = null;
    if (planId && docResult.success) {
      const autoDescription = description || 
        `Created document ${fileName} via workflow`;
      
      impactResult = await createPlanImpact({
        planId,
        filePath: docResult.fullPath || `${targetPath}/${fileName}`,
        changeType: 'CREATE',
        description: autoDescription,
        agent,
        metadata: {
          template: template.name || 'local-template',
          targetPath,
          fileName,
          workflow: 'createDoc-helper'
        }
      });
    }

    return {
      success: docResult.success,
      documentResult: docResult,
      impactResult,
      filePath: docResult.fullPath || `${targetPath}/${fileName}`,
      message: docResult.success 
        ? `Document created successfully: ${fileName}`
        : `Document creation failed: ${docResult.message}`,
      templateParams
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Document creation workflow failed: ${error.message}`,
      targetPath,
      fileName
    };
  }
}

/**
 * Helper specifically for plan documents
 * @param {Object} params - Plan document parameters
 * @param {string|number} params.planId - Plan ID
 * @param {Object} params.planData - Plan data object
 * @param {Function} params.template - Plan template function
 * @param {string} [params.agent] - Creating agent
 * @returns {Promise<Object>} Plan document creation result
 */
export async function createPlanDoc({
  planId,
  planData,
  template,
  agent = 'claude'
}) {
  const paddedPlanId = String(planId).padStart(4, '0');
  const safeName = planData.name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return await createDoc({
    targetPath: 'claude-plans/a-pending',
    fileName: `${paddedPlanId}-${safeName}.md`,
    template,
    templateParams: {
      planId: paddedPlanId,
      docID: planId,
      planData
    },
    planId,
    agent,
    description: `Created plan document for Plan ${paddedPlanId}: ${planData.name}`
  });
}

export default createDoc;