# Investigation Guide - Document Creation Workflows
**Plan:** 0019  < /dev/null |  **Created:** 2025-07-26 | **Agent:** Claude

## File Discovery Map

### Existing Pattern Reference
- **Primary Pattern**: `/packages/shared-imports/src/architecture/workflows/documents/createPlanDocument.js`
- **createDoc Utility**: `/packages/shared-imports/src/utils/fileOperations.js` (lines 145-192)
- **Template Pattern**: generatePlanTemplate function (lines 7-38)

### Target Implementation Files
- **createAnalysis**: `/packages/shared-imports/src/architecture/workflows/documents/createAnalysis.js`
- **createGuidance**: `/packages/shared-imports/src/architecture/workflows/documents/createGuidance.js`
- **Export Update**: `/packages/shared-imports/src/architecture/workflows/documents/index.js`

### Target Directory Structure
- **Analysis Documents**: `.kiro/NNNN/analysis/claude-analysis-TOPIC.md`
- **Guidance Documents**: `.kiro/NNNN/guidance/implementation-guidance-COMPONENT.md`
- **Specs Documents**: `.kiro/NNNN/specs/` (requirements.md, design.md, tasks.md)

## Integration Points

### Function Signatures (Token-Efficient API)
```javascript
// 20 tokens vs 500+ for manual creation
createAnalysis(planId, topic, analysisContent)
createGuidance(planId, component, guidanceContent)
```

### Template Structure Requirements
- **Analysis**: Claude architectural analysis with recommendations
- **Guidance**: Implementation guidance for specific components
- **Metadata**: Plan ID, creation date, agent attribution
- **Directory Auto-Creation**: createDoc handles nested .kiro structure

## Implementation Pattern
Follow createPlanDocument.js:
1. ID padding (`String(planId).padStart(4, '0')`)
2. Name sanitization (remove special chars, replace spaces with dashes)
3. Template generation with content injection
4. createDoc call with target directory
5. Consistent error handling and response format
