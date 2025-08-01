# Implementation Guidance: Plan Impact Tracking Workflow
**Plan**: 0019  < /dev/null |  **Created**: 2025-07-26 | **Agent**: Claude

## Implementation Overview
Build modular createPlanImpact workflow for tracking all file changes during plan implementation. Keep execCreateDoc focused on document creation only - impact tracking is separate, reusable utility.

## Core Architecture
```javascript
// Standalone impact tracking utility
export async function createPlanImpact({
  planId,
  filePath,
  changeType,
  description, 
  agent
}) {
  return await execDml({
    table: 'api_wf.plan_impacts',
    operation: 'INSERT',
    formData: {
      plan_id: planId,
      file_path: filePath,
      change_type: changeType,
      description,
      status: 'completed',
      created_by: agent
    },
    auditFields: true
  });
}
```

## Usage Patterns
```javascript
// Document creation workflows
const docResult = await execCreateDoc({ ... });
await createPlanImpact({
  planId: 19,
  filePath: docResult.fullPath,
  changeType: 'CREATE',
  description: 'Created Claude analysis for feature planning',
  agent: 'claude'
});

// Implementation workflows (Kiro)
await createPlanImpact({
  planId: 19,
  filePath: 'apps/wf-server/server/controller/execCreateDoc.js',
  changeType: 'CREATE',
  description: 'Added parameter-driven document creation controller',
  agent: 'kiro'
});
```

## Change Types
- CREATE: New files created
- MODIFY: Existing files changed  
- DELETE: Files removed
- MOVE: Files relocated

## Integration Points
- Document workflows call after execCreateDoc success
- Implementation workflows call during code changes
- Manual calls for any plan-related file modifications
- Database-driven audit trail for complete plan history

## Design Principles
- Modular and reusable across all workflows
- Separate from execCreateDoc - single responsibility
- Database-first using DML pattern
- Consistent impact recording for all agents

---
*Modular impact tracking for complete plan audit trails.*
