# Implementation Guidance: execCreateDoc API System
**Plan**: 0019  < /dev/null |  **Created**: 2025-07-26 | **Agent**: Claude

## Implementation Overview
Build execCreateDoc controller and docTypes configuration to enable React UI document creation via API endpoints. Follow existing execEventType pattern for consistency.

## Core Architecture
```javascript
// 1. createDocs/docTypes.js - Document type configurations
const DOC_TYPES = [
  {
    docID: 201,
    docType: 'createAnalysis',
    targetPath: '.kiro/:planId/analysis/',
    fileName: 'claude-analysis-:topic.md',
    template: 'analysisTemplate'
  },
  {
    docID: 202, 
    docType: 'createGuidance',
    targetPath: '.kiro/:planId/guidance/',
    fileName: 'implementation-guidance-:component.md',
    template: 'guidanceTemplate'
  }
];

// 2. controller/execCreateDoc.js - API endpoint
app.post('/api/execCreateDoc', async (req, res) => {
  const { docType, planId, topic, content } = req.body;
  const config = getDocType(docType);
  const result = executeDocCreation(config, { planId, topic, content });
  res.json(result);
});
```

## File Structure
```
packages/shared-imports/src/createDocs/
├── docTypes.js        # Document configurations
└── index.js           # Exports

apps/wf-server/server/controller/
└── execCreateDoc.js   # API controller
```

## Implementation Steps
1. Create docTypes.js with createAnalysis/createGuidance configs
2. Build execCreateDoc.js controller following execEventType pattern
3. Integrate with existing createDoc utility for file creation
4. Add API route registration
5. Test with React UI integration

## Key Requirements
- Parameter substitution (:planId, :topic in paths/filenames)
- Template generation for document content structure
- Error handling with proper HTTP status codes
- Consistent response format matching other exec controllers
- Integration with existing createDoc security validation

---
*Ready for Kiro implementation following established server patterns.*
