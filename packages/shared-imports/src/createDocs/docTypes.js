/**
 * Document Creation Types Configuration
 * Document definitions for createDoc API workflows
 */

const DOC_TYPES = [
  {
    docID: 201,
    docType: 'createAnalysis',
    category: 'agent:claude',
    targetPath: '.kiro/:planId/analysis/',
    fileName: 'claude-analysis-:topic.md',
    template: 'analysisTemplate',
    purpose: 'Create Claude analysis documents'
  },
  {
    docID: 202,
    docType: 'createGuidance',
    category: 'agent:claude', 
    targetPath: '.kiro/:planId/guidance/',
    fileName: 'implementation-guidance-:component.md',
    template: 'guidanceTemplate',
    purpose: 'Create implementation guidance documents'
  }
];

/**
 * Get document type configuration by docType
 */
const getDocType = (docType) => {
  return DOC_TYPES.find(doc => doc.docType === docType);
};

export {
  DOC_TYPES,
  getDocType
};
