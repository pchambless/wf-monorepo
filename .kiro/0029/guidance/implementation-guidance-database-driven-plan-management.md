# Implementation Guidance: Database-Driven Plan Management

## Summary
Eliminate plan document file overhead by implementing direct database queries for plan context.

## Implementation Strategy

### 1. Add planDetail EventType
**Location**: `/packages/shared-imports/src/events/plans/eventTypes.js`

Add new event:
```javascript
{
  eventID: 105,
  eventType: "planDetail", 
  category: "api:query",
  title: "Plan Detail",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  method: "GET",
  qrySQL: `
    SELECT *
    FROM api_wf.plans
    WHERE id = :planID
  `,
  params: [":planID"],
  primaryKey: "id",
  purpose: "Get detailed information for a specific plan"
}
```

### 2. Test Database Queries
- Use `execEventType('planDetail', { ':planID': 29 })` 
- Verify queryResolver handles `:planID` parameter correctly
- Compare results with current plan document approach
- Test with various plan IDs to ensure reliability

### 3. Update Plan Workflows
- Modify `createPlan.js` to optionally skip document creation
- Update session startup protocols to query database instead of reading files
- Test "Plan NNNN" workflow with database queries replacing file reads
- Ensure `.kiro/NNNN/` analysis/guidance folders still work independently

### 4. Evaluate File Elimination
- Test complete workflow without a-pending/b-completed/c-archived management
- Verify all plan context is available via database queries
- Document migration path from file-based to database-driven approach
- Assess impact on existing plan management UI

## Technical Notes
- Parameter format: `{ ':planID': 29 }` (colon required for queryResolver)
- Database is source of truth; files become unnecessary overhead
- Analysis/guidance workflows in `.kiro/NNNN/` remain file-based
- Plan status management happens entirely in database

## Success Criteria
- [ ] planDetail eventType working with parameter resolution
- [ ] Claude can query plan context via database instead of files
- [ ] Plan workflows simplified without file management overhead
- [ ] No loss of functionality compared to current approach

## Migration Strategy
1. Add planDetail eventType and test
2. Update workflows to support both database and file approaches
3. Test database-only workflow thoroughly
4. Phase out plan document creation when confident
5. Clean up file-based plan management code