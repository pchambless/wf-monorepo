# CreatePlan Workflow Implementation Guide

**Objective**: Implement atomic `createPlan()` workflow module as the foundational pattern for all business workflow modules.

## File Structure

```
packages/shared-imports/src/workflows/
├── index.js                    # Main export barrel
├── plans/
│   ├── createPlan.js          # PRIMARY IMPLEMENTATION TARGET
│   └── index.js               # Plan workflow exports
└── core/
    ├── workflowBase.js        # Common workflow utilities (future)
    └── transactionManager.js  # DB transaction helpers (future)
```

## Implementation Requirements

### 1. File: `packages/shared-imports/src/workflows/plans/createPlan.js`

```javascript
/**
 * Create Plan Workflow
 * Atomic operation: Plan + Documents + Impacts
 * 
 * @param {Object} planData - Plan creation data
 * @param {string} userID - User identifier for audit trail
 * @returns {Object} { success: boolean, planId: number, message: string }
 */
export const createPlan = async (planData, userID) => {
  // TODO: Implement transaction-based workflow
  // 1. Begin database transaction
  // 2. INSERT into api_wf.plans
  // 3. INSERT initial document into api_wf.plan_documents
  // 4. INSERT initial impact into api_wf.plan_impacts
  // 5. Commit transaction OR rollback on any failure
  // 6. Return success/failure with meaningful message
};
```

### 2. Database Operations Sequence

#### Step 1: Create Plan Record
```sql
INSERT INTO api_wf.plans (cluster, name, description, status, priority, created_at, created_by)
VALUES (?, ?, ?, 'pending', ?, NOW(), ?)
```
- Use provided planData fields
- Status always starts as 'pending'
- Audit fields handled by DML processor

#### Step 2: Create Initial Document
```sql
INSERT INTO api_wf.plan_documents (plan_id, document_type, title, file_path, author, status, created_at, created_by)
VALUES (?, 'plan', ?, ?, ?, 'draft', NOW(), ?)
```
- plan_id = newly created plan ID from Step 1
- document_type = 'plan' (initial user idea document)
- title = plan name (e.g., "Architecture Refinements")
- file_path = generated using plan naming pattern (see below)
- author = userID
- status = 'draft'

**Plan Document Naming Pattern:**
```javascript
const generatePlanDocumentPath = (planId, planName) => {
  const paddedId = String(planId).padStart(4, '0');
  // Sanitize plan name for filename (remove special chars, normalize spaces)
  const safeName = planName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, ' ').trim();
  return `claude-plans/a-pending/${paddedId}-${safeName}.md`;
};

// Example: Plan 21 "Architecture Refinements" 
// → "claude-plans/a-pending/0021-Architecture Refinements.md"
```

#### Step 3: Create Initial Impact Tracking
```sql
INSERT INTO api_wf.plan_impacts (plan_id, file_path, change_type, status, description, created_at, created_by)
VALUES (?, ?, 'created', 'pending', 'Plan creation workflow executed', NOW(), ?)
```
- plan_id = newly created plan ID from Step 1
- file_path = same generated path as document (tracks plan document creation)
- change_type = 'created'
- status = 'pending'
- description = 'Plan creation workflow executed'

**Impact Tracking Purpose:**
Creates the first entry in the plan's change log. Future document updates will add additional impact records with change_type like 'scope-expansion', 'rollback', etc.

### 3. Transaction Pattern

```javascript
// Implementation pattern with plan naming
const transaction = await db.beginTransaction();
try {
  // Step 1: Create plan
  const planResult = await execDml("INSERT", { 
    table: "api_wf.plans", 
    method: "INSERT", 
    data: { ...planData, userID } 
  });
  const planId = planResult.insertId;
  
  // Step 2: Generate document path and create document record
  const documentPath = generatePlanDocumentPath(planId, planData.name);
  const documentData = {
    plan_id: planId,
    document_type: 'plan',
    title: planData.name,
    file_path: documentPath,
    author: userID,
    status: 'draft',
    userID
  };
  await execDml("INSERT", { table: "api_wf.plan_documents", method: "INSERT", data: documentData });
  
  // Step 3: Create initial impact tracking
  const impactData = {
    plan_id: planId,
    file_path: documentPath,
    change_type: 'created',
    status: 'pending',
    description: 'Plan creation workflow executed',
    userID
  };
  await execDml("INSERT", { table: "api_wf.plan_impacts", method: "INSERT", data: impactData });
  
  await transaction.commit();
  const paddedPlanId = String(planId).padStart(4, '0');
  return { 
    success: true, 
    planId, 
    paddedPlanId,
    documentPath,
    message: `Plan ${paddedPlanId} created successfully`,
    details: { planId, documentPath, impactRecords: 1 }
  };
} catch (error) {
  await transaction.rollback();
  throw new Error(`Plan creation failed: ${error.message}`);
}
```

### 4. Export Structure

#### File: `packages/shared-imports/src/workflows/plans/index.js`
```javascript
export { createPlan } from './createPlan.js';
```

#### File: `packages/shared-imports/src/workflows/index.js`
```javascript
// Plan workflows
export { createPlan } from './plans/index.js';
```

### 5. Integration Points

#### Update CreatePlanForm.jsx
Replace current execDml call with workflow call:
```javascript
// OLD - Direct DML operations
const planResult = await execDml("INSERT", { table: "api_wf.plans", method: "INSERT", data: planData });

// NEW - Workflow module
import { createPlan } from '@whatsfresh/shared-imports/workflows';
const result = await createPlan(planData, "user");
```

### 6. Error Handling Requirements

- **Database errors**: Catch and provide business-meaningful messages
- **Validation errors**: Check required fields before database operations
- **Transaction failures**: Ensure complete rollback, no partial data
- **Return format**: Always return { success: boolean, planId?: number, message: string }

### 7. Testing Strategy

#### Test Data Creation
- Use workflow to create test plans (Plan 0021, 0022, etc.)
- Validate all three tables have consistent data
- Test error scenarios (missing fields, database constraints)

#### Success Criteria
1. **Plan 0020 created** via workflow shows in all three tables
2. **UI integration** works with single workflow call
3. **Error handling** provides clear messages for failures
4. **Transaction integrity** - no partial data on failures

## Implementation Notes

### Current Issue Resolution
The current CreatePlanForm only creates plan records. This workflow addresses:
- Missing plan_documents entries
- Missing plan_impacts entries  
- Lack of atomic operations
- Inconsistent error handling

### Database Access
Use existing execDml function for database operations within workflow. The workflow orchestrates multiple DML operations within a transaction scope.

### Future Expansion
This creates the template for:
- `completePlan()` workflow
- `deletePlan()` workflow  
- Other business workflow modules

## Priority: HIGH

This is the foundational pattern for the entire workflow module system. Once createPlan() works, all other workflows follow the same pattern.

**Success Metric**: Plan 0020 creation through workflow results in consistent data across plans, plan_documents, and plan_impacts tables.