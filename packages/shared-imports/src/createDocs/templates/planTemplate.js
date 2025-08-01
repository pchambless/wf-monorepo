/**
 * Plan Document Template
 * Generates formatted plan documents
 */

/**
 * Generate plan document content
 * @param {Object} params - Template parameters
 * @returns {string} Formatted plan document
 */
export function planTemplate(params) {
  const { planId, docID, planData = {}, ...options } = params;
  const currentDate = new Date().toISOString().split("T")[0];

  return `# Plan ${planId} - ${planData.name || "Untitled Plan"}
**DocID**: ${docID || planId} | **Created**: ${currentDate}

## User Idea
${planData.description || "No description provided"}

## Next Steps
- [ ] Architecture analysis needed
- [ ] Design document creation
- [ ] Implementation planning
- [ ] Testing strategy

## Current Status
- **Phase**: Planning
- **Database**: api_wf.plans table
- **Documents**: Tracked in api_wf.plan_documents`;
}

export default planTemplate;
