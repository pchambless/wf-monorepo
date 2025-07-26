/**
 * Plan Document Creation Workflow
 */

import { createDoc } from '../../../utils/index.js';

function generatePlanTemplate(planData, planId) {
  const paddedId = String(planId).padStart(4, '0');
  
  return `# Plan ${paddedId} - ${planData.name}

## User Idea
${planData.description}

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: ${paddedId}
- **Cluster**: ${planData.cluster}
- **Complexity**: ${planData.complexity}
- **Priority**: ${planData.priority}

### Plan Dependencies
- **Blocks**: TBD
- **Blocked by**: TBD
- **Related**: TBD

## Key Deliverables
[List of main deliverables]

## Success Criteria
[How to measure completion]

## Current Status
- **Phase**: Planning
- **Created**: ${new Date().toISOString().split('T')[0]}
`;
}

export async function createPlanDocument(planId, planData) {
  try {
    const paddedId = String(planId).padStart(4, '0');
    const safeName = planData.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    const fileName = `${paddedId}-${planData.cluster}-${safeName}.md`;
    const documentContent = generatePlanTemplate(planData, planId);
    
    const result = createDoc('claude-plans/a-pending', fileName, documentContent);
    
    return {
      success: result.success,
      filePath: result.fullPath,
      fileName,
      message: result.success ? `Plan document created: ${fileName}` : result.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Plan document creation failed: ${error.message}`
    };
  }
}

export default createPlanDocument;