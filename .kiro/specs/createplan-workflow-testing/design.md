# CreatePlan Workflow Testing Design

## Overview

This document outlines the testing design for validating the createPlan() workflow implementation. The testing approach focuses on atomic operations, data consistency, error handling, and integration with the Architecture Intel Dashboard.

## Architecture

### Testing Components

```
Architecture Intel Dashboard
├── CreatePlanForm.jsx (UI Component)
├── createPlan() workflow (Business Logic)
├── execDml() (Database Layer)
└── Database Tables (Data Layer)
    ├── api_wf.plans
    ├── api_wf.plan_documents
    └── api_wf.plan_impacts
```

### Test Data Flow

1. **User Input** → CreatePlanForm collects plan data
2. **Form Submission** → Calls createPlan(planData, userID)
3. **Workflow Execution** → Sequential database operations
4. **Response Handling** → UI displays success/error feedback
5. **Data Validation** → Verify all three tables have consistent records

## Components and Interfaces

### CreatePlan Workflow Interface

```javascript
/**
 * @param {Object} planData
 * @param {string} planData.cluster - Business cluster (required)
 * @param {string} planData.name - Plan name (required)
 * @param {string} planData.description - Plan description (required)
 * @param {string} planData.priority - Priority level (optional, default: "normal")
 * @param {string} userID - User identifier for audit trail (required)
 * @returns {Promise<Object>} Workflow result
 */
```

### Expected Success Response

```javascript
{
  success: true,
  planId: 22,
  paddedPlanId: "0022",
  documentPath: "claude-plans/a-pending/0022-Test Plan Name.md",
  message: "Plan 0022 created successfully",
  details: {
    planId: 22,
    documentPath: "claude-plans/a-pending/0022-Test Plan Name.md",
    impactRecords: 1,
    description: "Plan \"Test Plan Name\" created with documents and impact tracking."
  }
}
```

### Expected Error Response

```javascript
{
  success: false,
  message: "Plan creation failed: Missing required fields",
  error: "Missing required fields: cluster, name, and description are required"
}
```

## Data Models

### Plans Table Record

```sql
INSERT INTO api_wf.plans (
  cluster,        -- e.g., "ARCHITECTURE"
  name,           -- e.g., "Test Plan Name"
  description,    -- User-provided description
  status,         -- Always "pending" for new plans
  priority,       -- e.g., "normal", "high", "urgent"
  created_by,     -- User identifier
  created_at      -- ISO timestamp
)
```

### Plan Documents Table Record

```sql
INSERT INTO api_wf.plan_documents (
  plan_id,        -- Foreign key to plans.id
  document_type,  -- Always "plan" for initial document
  title,          -- Same as plans.name
  file_path,      -- Generated document path
  author,         -- Same as userID
  status,         -- Always "draft" for new documents
  created_by,     -- User identifier
  created_at      -- ISO timestamp
)
```

### Plan Impacts Table Record

```sql
INSERT INTO api_wf.plan_impacts (
  plan_id,        -- Foreign key to plans.id
  file_path,      -- Same as plan_documents.file_path
  change_type,    -- Always "CREATED" for new plans
  status,         -- Always "pending" for new impacts
  description,    -- "Plan creation workflow executed"
  created_by,     -- User identifier
  created_at      -- ISO timestamp
)
```

## Error Handling

### Validation Errors

- **Missing required fields**: Return validation error before database operations
- **Invalid userID**: Return authentication error before database operations
- **Empty strings**: Treat as missing required fields

### Database Errors

- **Connection failures**: Return "Database connection failed" message
- **Constraint violations**: Return "Data validation failed" message
- **Transaction failures**: Return "Plan creation failed" with specific error

### Rollback Strategy

Currently sequential operations without transactions. Future enhancement will add proper transaction management with rollback capabilities.

## Testing Strategy

### Test Categories

1. **Happy Path Testing**

   - Valid plan creation with all required fields
   - Verify all three database tables have records
   - Confirm document path generation

2. **Validation Testing**

   - Missing required fields (cluster, name, description)
   - Missing userID
   - Empty string handling

3. **Edge Case Testing**

   - Special characters in plan names
   - Very long plan names
   - Unicode characters in descriptions

4. **Error Handling Testing**

   - Database connection failures (simulated)
   - Constraint violations
   - Partial failure scenarios

5. **Integration Testing**
   - CreatePlanForm → createPlan workflow
   - Success message display
   - Form reset behavior
   - Error message display

### Test Data Patterns

```javascript
// Valid test plan
const validPlan = {
  cluster: "TESTING",
  name: "Test Plan 001",
  description: "This is a test plan for workflow validation",
  priority: "normal",
};

// Invalid test plans
const missingCluster = { name: "Test", description: "Test" };
const missingName = { cluster: "TEST", description: "Test" };
const missingDescription = { cluster: "TEST", name: "Test" };
```

### Verification Queries

```sql
-- Verify plan creation
SELECT * FROM api_wf.plans WHERE name = 'Test Plan 001';

-- Verify document creation
SELECT * FROM api_wf.plan_documents WHERE plan_id = ?;

-- Verify impact creation
SELECT * FROM api_wf.plan_impacts WHERE plan_id = ?;

-- Verify data consistency
SELECT
  p.id, p.name,
  pd.title, pd.file_path,
  pi.file_path, pi.change_type
FROM api_wf.plans p
JOIN api_wf.plan_documents pd ON p.id = pd.plan_id
JOIN api_wf.plan_impacts pi ON p.id = pi.plan_id
WHERE p.id = ?;
```

## Implementation Notes

### Current Limitations

- No transaction management (sequential operations)
- No physical file creation (database records only)
- No automatic cleanup for test data

### Future Enhancements

- Add proper database transactions
- Implement physical file creation
- Add deletePlan() workflow for cleanup
- Add batch testing capabilities

### Testing Environment

- Use Architecture Intel Dashboard at `/architecture`
- Test with various plan names and descriptions
- Verify database records through direct queries
- Monitor console logs for workflow execution details
