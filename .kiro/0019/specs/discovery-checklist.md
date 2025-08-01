# Discovery Checklist - Document Creation Workflows
**Plan:** 0019  < /dev/null |  **Agent:** Claude | **Created:** 2025-07-26

## Pre-Implementation Analysis

### File System Investigation
- [ ] **Verify createPlanDocument pattern** in `/packages/shared-imports/src/architecture/workflows/documents/createPlanDocument.js`
- [ ] **Test createDoc utility** - ensure it handles nested .kiro directory creation
- [ ] **Check export structure** in `/packages/shared-imports/src/architecture/workflows/documents/index.js`
- [ ] **Validate directory paths** - .kiro/NNNN/analysis/ and .kiro/NNNN/guidance/ auto-creation

### Pattern Validation
- [ ] **ID padding consistency** - String(planId).padStart(4, '0') across all functions
- [ ] **Name sanitization** - remove special chars, replace spaces with dashes, lowercase
- [ ] **Error handling** - consistent success/error response structure
- [ ] **Template structure** - metadata, content sections, attribution

### Integration Points
- [ ] **Function signatures** - createAnalysis(planId, topic, content), createGuidance(planId, component, content)
- [ ] **Response format** - match createPlanDocument success/error structure
- [ ] **File naming** - claude-analysis-TOPIC.md, implementation-guidance-COMPONENT.md
- [ ] **Directory structure** - .kiro/NNNN/analysis/ and .kiro/NNNN/guidance/

## Implementation Checklist

### createAnalysis Function
- [ ] **Create file** `/packages/shared-imports/src/architecture/workflows/documents/createAnalysis.js`
- [ ] **Import createDoc** from '../../../utils/index.js'
- [ ] **Implement generateAnalysisTemplate** function with metadata and content sections
- [ ] **Add function export** with error handling and response formatting
- [ ] **Test with sample data** - verify file creation and template generation

### createGuidance Function  
- [ ] **Create file** `/packages/shared-imports/src/architecture/workflows/documents/createGuidance.js`
- [ ] **Import createDoc** from '../../../utils/index.js'
- [ ] **Implement generateGuidanceTemplate** function with implementation focus
- [ ] **Add function export** with error handling and response formatting
- [ ] **Test with sample data** - verify file creation and template generation

### Export Configuration
- [ ] **Update index.js** to export createAnalysis and createGuidance functions
- [ ] **Verify import paths** and function availability
- [ ] **Test end-to-end** - import and execute from external modules

## Testing Strategy

### Unit Testing
- [ ] **Test ID padding** - verify 4-digit format with leading zeros
- [ ] **Test name sanitization** - special chars removed, spaces to dashes, lowercase
- [ ] **Test template generation** - proper metadata injection and content formatting
- [ ] **Test error handling** - invalid inputs return proper error responses

### Integration Testing
- [ ] **Test directory creation** - verify .kiro/NNNN structure auto-creation
- [ ] **Test file creation** - documents created in correct locations with proper content
- [ ] **Test response format** - success/error responses match expected structure
- [ ] **Test with UI integration** - verify 20-token efficiency goal achieved

## Success Criteria
- [ ] **Token efficiency achieved** - 20 tokens vs 500+ for manual document creation
- [ ] **Directory structure correct** - files created in .kiro/NNNN/analysis/ and .kiro/NNNN/guidance/
- [ ] **Template quality** - professional formatting with proper metadata and structure
- [ ] **Error handling robust** - graceful failure with descriptive error messages
- [ ] **Export integration** - functions available for import from UI components
