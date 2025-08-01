# Implementation Guidance: Workflow Architecture Reorganization
**Plan**: 0019  < /dev/null |  **Created**: 2025-07-26 | **Agent**: Claude

## Implementation Overview
Reorganize workflow architecture into ADHD-friendly, domain-based modules. Each document type gets its own complete module with workflows and templates. Shared utilities live in shared/ module.

## Target Architecture
```
workflows/
├── plans/
│   ├── createPlan.js          # Plan creation workflow
│   ├── deletePlan.js          # Plan deletion workflow
│   ├── Template.js            # Plan template (planTemplate)
│   └── index.js               # Module exports
├── analysis/
│   ├── createAnalysis.js      # Analysis creation workflow
│   ├── Template.js            # Analysis template (analysisTemplate)
│   └── index.js               # Module exports
├── guidance/
│   ├── createGuidance.js      # Guidance creation workflow
│   ├── Template.js            # Guidance template (guidanceTemplate)
│   └── index.js               # Module exports
├── specs/
│   ├── createRequirements.js  # Requirements workflow
│   ├── createDesign.js        # Design workflow
│   ├── RequirementsTemplate.js # Requirements template
│   ├── DesignTemplate.js      # Design template
│   └── index.js               # Module exports
└── shared/
    ├── createPlanImpact.js         # Impact tracking utility
    ├── createDocumentWithImpact.js # Helper wrapper
    └── index.js                    # Shared exports
```

## Migration Steps

### 1. Create New Domain Modules
Create clean domain-based structure:
- Move createPlan.js → workflows/plans/
- Move createAnalysis.js → workflows/analysis/
- Move createGuidance.js → workflows/guidance/
- Create workflows/specs/ for requirements and design

### 2. Reorganize Templates
Move templates to domain modules:
- analysisTemplate.js → workflows/analysis/Template.js
- guidanceTemplate.js → workflows/guidance/Template.js
- planTemplate.js → workflows/plans/Template.js
- Create RequirementsTemplate.js and DesignTemplate.js in specs/

### 3. Shared Utilities
Move shared functions to workflows/shared/:
- createPlanImpact.js (used by all workflows)
- createDocumentWithImpact.js (helper wrapper)

### 4. Update Import Patterns
```javascript
// In any workflow module
import { createPlanImpact } from '../shared/createPlanImpact.js';
import { execCreateDoc } from '@whatsfresh/shared-imports/api';

// Example in analysis/createAnalysis.js
export async function createAnalysis(planId, topic, content) {
  const docResult = await execCreateDoc({
    targetPath: '.kiro/:planId/analysis/',
    fileName: 'claude-analysis-:topic.md',
    template: 'analysisTemplate',
    planId,
    topic,
    content
  });

  if (docResult.success) {
    await createPlanImpact({
      planId,
      filePath: docResult.fullPath,
      changeType: 'CREATE',
      description: `Created Claude analysis: ${topic}`,
      agent: 'claude'
    });
  }

  return docResult;
}
```

## Module Index Files
Each module exports its functionality:

### workflows/plans/index.js
```javascript
export { createPlan } from './createPlan.js';
export { deletePlan } from './deletePlan.js';
export { planTemplate } from './Template.js';
```

### workflows/analysis/index.js
```javascript
export { createAnalysis } from './createAnalysis.js';
export { analysisTemplate } from './Template.js';
```

### workflows/shared/index.js
```javascript
export { createPlanImpact } from './createPlanImpact.js';
export { createDocumentWithImpact } from './createDocumentWithImpact.js';
```

## Benefits of New Architecture

### ADHD-Friendly Design
- Clear domain separation - each folder = one document type
- Minimal cognitive load - everything related is in one place
- Predictable structure - Template.js always in same location
- No hunting - workflow and template always together

### Maintainability
- Domain ownership - analysis team owns analysis/
- Colocation - template lives next to workflow that uses it
- Consistent patterns - every module organized the same way
- Easy navigation - know exactly where to find things

### Scalability
- Easy to add new document types - just create new module
- Shared utilities centralized in shared/
- Clear import patterns across all modules
- Independent module development

## Integration with Impact Tracking
Every workflow calls shared createPlanImpact:

```javascript
// Standard pattern for all workflows
const docResult = await execCreateDoc(docParams);

if (docResult.success) {
  await createPlanImpact({
    planId,
    filePath: docResult.fullPath,
    changeType: 'CREATE',
    description: 'Document description',
    agent: 'agent_name'
  });
}
```

## Clean Up Current Structure
Remove or reorganize existing scattered files:
- Consolidate current documents/ folder into domain modules
- Remove redundant template organization
- Update all imports to use new structure
- Test all workflows after reorganization

---
*ADHD-friendly, domain-based workflow architecture for maintainable development.*
