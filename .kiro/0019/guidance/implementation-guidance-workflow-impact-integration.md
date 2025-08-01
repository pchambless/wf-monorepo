# Implementation Guidance: Workflow Impact Integration
**Plan**: 0019  < /dev/null |  **Created**: 2025-07-26 | **Agent**: Claude

## Implementation Overview
Integrate createPlanImpact into 5 core document workflows to automatically track major milestones. Build impact tracking into plan creation, analysis, guidance, requirements, and design workflows.

## Workflow Integration Points

### 1. Plan Creation Workflow
```javascript
// User creates plan via UI
const planResult = await execDml('INSERT', {
  table: 'api_wf.plans',
  formData: planData
});

const docResult = await execCreateDoc({
  targetPath: 'claude-plans/a-pending/',
  fileName: ':planId-:cluster-:name.md',
  template: 'planTemplate',
  planId: planResult.insertId,
  ...planData
});

// Auto-track plan creation
await createPlanImpact({
  planId: planResult.insertId,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: `Created plan: ${planData.name}`,
  agent: 'user'
});
```

### 2. Analysis Document Workflow (Claude)
```javascript
const docResult = await execCreateDoc({
  targetPath: '.kiro/:planId/analysis/',
  fileName: 'claude-analysis-:topic.md',
  template: 'analysisTemplate',
  planId: 19,
  topic: 'feature',
  content: 'Analysis content...'
});

await createPlanImpact({
  planId: 19,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: `Created Claude analysis: ${topic}`,
  agent: 'claude'
});
```

### 3. Guidance Document Workflow (Claude)
```javascript
const docResult = await execCreateDoc({
  targetPath: '.kiro/:planId/guidance/',
  fileName: 'implementation-guidance-:component.md',
  template: 'guidanceTemplate',
  planId: 19,
  component: 'modal-system',
  content: 'Implementation guidance...'
});

await createPlanImpact({
  planId: 19,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: `Created implementation guidance: ${component}`,
  agent: 'claude'
});
```

### 4. Requirements Document Workflow (Kiro)
```javascript
const docResult = await execCreateDoc({
  targetPath: '.kiro/:planId/specs/',
  fileName: 'requirements.md',
  template: 'requirementsTemplate',
  planId: 19,
  content: 'Requirements content...'
});

await createPlanImpact({
  planId: 19,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: 'Created requirements specification',
  agent: 'kiro'
});
```

### 5. Design Document Workflow (Kiro)
```javascript
const docResult = await execCreateDoc({
  targetPath: '.kiro/:planId/specs/',
  fileName: 'design.md',
  template: 'designTemplate',
  planId: 19,
  content: 'Design content...'
});

await createPlanImpact({
  planId: 19,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: 'Created design specification',
  agent: 'kiro'
});
```

## Helper Function Pattern
```javascript
// Reusable workflow helper
export async function createDocumentWithImpact({
  planId,
  agent,
  docParams,
  impactDescription
}) {
  const docResult = await execCreateDoc(docParams);
  
  if (docResult.success) {
    await createPlanImpact({
      planId,
      filePath: docResult.fullPath,
      changeType: 'CREATE',
      description: impactDescription,
      agent
    });
  }
  
  return docResult;
}
```

## Error Handling
- Impact tracking failures should not break document creation
- Log impact tracking errors but continue workflow
- Impact tracking is supplementary, not required for workflow success

## Integration Benefits
- Complete audit trail for major plan milestones
- Database-driven progress tracking
- Clear visibility into plan document lifecycle
- Agent accountability for document creation

---
*Integrate impact tracking into 5 core workflows for milestone visibility.*
