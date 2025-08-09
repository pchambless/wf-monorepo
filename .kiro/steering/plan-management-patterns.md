---
inclusion: fileMatch
fileMatchPattern: "apps/wf-client/src/pages/plan-management/**/*"
---

# Plan Management Development Patterns

Specific patterns and automation for plan management features.

## EventType Integration Patterns

### Status Filtering Pattern

- `select-PlanStatus` → `grid-planList` → `tab-planDetail` → `form-planDetail`
- Always filter at database level, not client-side
- Use `:planStatus` parameter in SQL queries
- Handle "All Statuses" case with conditional SQL

### Master-Detail Pattern

- Grid selection triggers detail loading
- Use plan ID parameter passing: `grid-planList` → `form-planDetail`
- Implement proper loading states and error handling

## Component Patterns

### SelStatusWidget

- Always load from CONFIG eventType (`select-PlanStatus`)
- Use button-based UI for limited status options
- Show active status clearly with visual feedback
- Include plan counts when possible

### Plan List Grid

- Filter by status parameter
- Show format: "NNNN - Plan Name"
- Include workflow triggers for CRUD operations
- Handle empty states when no status selected

### Plan Detail Forms

- Load via `form-planDetail` eventType
- Include all audit fields (created_at, updated_at, etc.)
- Connect to impact tracking workflows
- Handle validation and error states

## Workflow Integration

- All plan operations must include impact tracking
- Use standard workflow patterns: validateAccess → updateRecord → trackImpact
- Handle context refresh after operations
- Include proper error handling and retry logic

## Database Patterns

- Always include `deleted_at IS NULL` in queries
- Use proper parameter binding for security
- Include audit fields in all plan-related tables
- Follow established naming conventions

## Testing Patterns

- Test status filtering with various combinations
- Verify parameter passing between components
- Test workflow execution and error handling
- Validate impact tracking integration
