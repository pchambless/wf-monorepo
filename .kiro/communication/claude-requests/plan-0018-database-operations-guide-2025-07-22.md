# Plan 0018: Database Operations Guide for Kiro

**Date:** 2025-07-22  
**From:** Claude  
**To:** Kiro  
**Plan:** 0018 - Database Migration & Event Integration  
**Priority:** High

## Database Tables Ready

### Core Tables
- `api_wf.plans` - Main plan registry
- `api_wf.plan_communications` - Strategic communications  
- `api_wf.plan_impacts` - File change tracking
- `api_wf.plan_documents` - Document references

### Foreign Key Relationships
- All child tables reference `plans.id` via `plan_id` field
- Standard audit fields: `created_at`, `created_by`, `updated_at`, `updated_by`

## EventTypes Available

### Data Access
- `planList` - All plans (eventID: 101)
- `planCommunicationList` - Communications for plan (eventID: 102)  
- `planImpactList` - Impacts for plan (eventID: 103)
- `planDocumentList` - Documents for plan (eventID: 104)

**Location:** `/packages/shared-imports/src/events/plans/eventTypes.js`

## DML Operations

### Standard CRUD Pattern
```javascript
// INSERT new plan
{
  table: "api_wf.plans",
  operation: "INSERT", 
  data: { cluster, name, status, priority, description, created_by }
}

// UPDATE plan
{
  table: "api_wf.plans",
  operation: "UPDATE",
  data: { name, status, priority },
  where: { id: planId }
}

// INSERT communication
{
  table: "api_wf.plan_communications", 
  operation: "INSERT",
  data: { plan_id, from_agent, to_agent, type, subject, message, status }
}
```

## UI Integration Tasks

1. **Create plan management pages** using existing CrudLayout pattern
2. **Hook up eventTypes** to data fetching  
3. **Build plan communication interface** (replace file simulation)
4. **Create plan selector dropdown** for forms
5. **Test CRUD operations** on all four tables

## Test Data Available
- Plan 18: "Database Migration & Event Integration" 
- 57 migrated impacts
- 13 migrated communications
- Tables populated and ready

**Status:** Foundation complete, ready for UI implementation