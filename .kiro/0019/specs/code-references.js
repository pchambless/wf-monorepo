/**
 * Code References for Document Creation Workflows
 * Plan 0019 - Implementation pattern extraction
 */

// Current createPlanDocument pattern (createPlanDocument.js, lines 40-63)
const createPlanDocumentPattern = `
export async function createPlanDocument(planId, planData) {
  try {
    const paddedId = String(planId).padStart(4, '0');
    const safeName = planData.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    const fileName = \`${paddedId}-${planData.cluster}-${safeName}.md\`;
    const documentContent = generatePlanTemplate(planData, planId);
    
    const result = createDoc('claude-plans/a-pending', fileName, documentContent);
    
    return {
      success: result.success,
      filePath: result.fullPath,
      fileName,
      message: result.success ? \`Plan document created: ${fileName}\` : result.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: \`Plan document creation failed: ${error.message}\`
    };
  }
}
`;

// Template generation pattern (createPlanDocument.js, lines 7-38)
const templatePattern = `
function generatePlanTemplate(planData, planId) {
  const paddedId = String(planId).padStart(4, '0');
  
  return \`# Plan ${paddedId} - ${planData.name}

## User Idea
${planData.description}

## Implementation Impact Analysis
### Impact Summary
- **Plan ID**: ${paddedId}
- **Cluster**: ${planData.cluster}
- **Complexity**: ${planData.complexity}
- **Priority**: ${planData.priority}

## Key Deliverables
[List of main deliverables]

## Current Status
- **Phase**: Planning
- **Created**: ${new Date().toISOString().split('T')[0]}
\`;
}
`;

// createDoc usage pattern (fileOperations/index.js, lines 145-192)
const createDocUsage = `
// Basic usage
const result = createDoc(filePath, fileName, content);

// Response structure
{
  success: true,
  fullPath: '/absolute/path/to/file',
  message: 'Document created successfully: /path'
}

// Error structure  
{
  success: false,
  error: 'Technical error message',
  message: 'User-friendly error message',
  code: 'ERROR_TYPE'
}
`;

// Target function signatures for Plan 0019
const targetFunctions = `
// createAnalysis function signature
export async function createAnalysis(planId, topic, analysisContent) {
  const paddedId = String(planId).padStart(4, '0');
  const safeTopic = topic.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').trim().toLowerCase();
  const fileName = \`claude-analysis-${safeTopic}.md\`;
  const documentContent = generateAnalysisTemplate(planId, topic, analysisContent);
  
  const result = createDoc(\`.kiro/${paddedId}/analysis\`, fileName, documentContent);
  return formatResponse(result, fileName, 'Analysis');
}

// createGuidance function signature  
export async function createGuidance(planId, component, guidanceContent) {
  const paddedId = String(planId).padStart(4, '0');
  const safeComponent = component.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').trim().toLowerCase();
  const fileName = \`implementation-guidance-${safeComponent}.md\`;
  const documentContent = generateGuidanceTemplate(planId, component, guidanceContent);
  
  const result = createDoc(\`.kiro/${paddedId}/guidance\`, fileName, documentContent);
  return formatResponse(result, fileName, 'Guidance');
}
`;
