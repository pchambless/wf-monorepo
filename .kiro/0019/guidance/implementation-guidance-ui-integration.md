# Implementation Guidance: UI Integration for Document Workflows
**DocID**: 19  < /dev/null |  **Created**: 2025-07-26 | **Agent**: Claude

## Implementation Overview
Build React UI components to integrate with the completed Plan 0019 document workflow infrastructure. Create forms for document creation, dashboards for impact tracking, and interfaces for agent coordination.

## Core UI Components Needed

### 1. Plan Creation Form
```javascript
// PlanCreationForm.jsx
import { execCreateDoc } from '@whatsfresh/shared-imports/api';
import { createPlanImpact } from '@whatsfresh/shared-imports/workflows/shared';

const handleCreatePlan = async (planData) => {
  // 1. Create database record
  const planResult = await execDml('INSERT', {
    table: 'api_wf.plans',
    formData: planData
  });
  
  // 2. Create plan file
  const docResult = await execCreateDoc({
    targetPath: 'claude-plans/a-pending/',
    fileName: ':planId-:cluster-:name.md',
    template: 'planTemplate',
    planId: planResult.insertId,
    ...planData
  });
  
  // 3. Track impact
  await createPlanImpact({
    planId: planResult.insertId,
    filePath: docResult.fullPath,
    changeType: 'CREATE',
    description: `Created plan: ${planData.name}`,
    agent: 'user'
  });
};
```

### 2. Document Creation Interface
```javascript
// DocumentCreationForm.jsx
const handleCreateAnalysis = async (analysisData) => {
  const docResult = await execCreateDoc({
    targetPath: '.kiro/:planId/analysis/',
    fileName: 'claude-analysis-:topic.md',
    template: 'analysisTemplate',
    planId: analysisData.planId,
    topic: analysisData.topic,
    content: analysisData.content,
    agent: 'claude'
  });
  
  // Show delivery modal for coordination
  showDeliveryModal(docResult, 'analysis');
};
```

### 3. Impact Tracking Dashboard
```javascript
// ImpactTrackingDashboard.jsx
const [impacts, setImpacts] = useState([]);

useEffect(() => {
  const fetchImpacts = async () => {
    const result = await execEvent('planImpactList', { planId });
    setImpacts(result.data);
  };
  fetchImpacts();
}, [planId]);

return (
  <div className=impact-dashboard>
    {impacts.map(impact => (
      <div key={impact.id} className=impact-item>
        <span className=change-type>{impact.change_type}</span>
        <span className=file-path>{impact.file_path}</span>
        <span className=description>{impact.description}</span>
        <span className=agent>{impact.created_by}</span>
      </div>
    ))}
  </div>
);
```

## Integration Strategy
1. Start with plan creation form - test database + file creation
2. Add document creation interfaces for analysis/guidance
3. Build impact tracking dashboard for progress visibility
4. Integrate delivery modal system for agent coordination
5. Test end-to-end workflows with real user interactions

## Error Handling
- Validate form inputs before API calls
- Show user-friendly error messages for API failures
- Graceful degradation if impact tracking fails
- Retry mechanisms for network errors

## Testing Approach
- Manual testing with actual document creation
- Verify database records are created correctly
- Check file creation in correct locations
- Validate impact tracking captures all changes

---
*Implementation guidance for connecting UI to document workflow infrastructure.*
