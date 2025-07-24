# DEVTOOLS - Planning Enhancements

## User Idea
[Brief description of the feature/fix/enhancement]

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0019
- **Files**: 8 (see impact-tracking.json: plan_id="0019")
- **Complexity**: Medium
- **Packages**: shared-imports (5), claude-plans (2), apps/wf-client (1)
- **Blast Radius**: DEVTOOLS (medium)

### Impact Tracking Status
- **Predicted**: 8 files
- **Actual**: 8 files (baseline analysis)
- **Accuracy**: 100% (initial prediction)
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: Future plan automation workflows, Document management integration
- **Blocked by**: Plan 0018 ✅ (Universal Document Update Script - COMPLETED)
- **Related**: Plan 0016 (User Communication Interface) - shared UI patterns
- **File Conflicts**: None identified at this time

## Core Concept
**Database-First Planning System**: Complete migration from file-based tracking to database-driven workflows. Eliminate `.kiro/communication/` and `claude-plans/impact-tracking.json` in favor of proper database tables (`api_wf.plans`, `api_wf.plan_impacts`, `api_wf.communications`). UI-integrated automation executes document-update.js to sync files → database, not file-based coordination.

## Key Deliverables

### Database-First Migration
- **Plan impacts** → Migrate from `impact-tracking.json` to `api_wf.plan_impacts` table
- **Communications** → Migrate from `.kiro/communication/` to `api_wf.communications` table
- **Real-time status** → Database queries replace file-based coordination
- **Audit trails** → Proper database audit fields replace manual file tracking

### UI-Database Integration
- **Plan creation** → Direct database insert + auto-sync with document-update.js
- **Communication forms** → Store in `api_wf.communications` table + file generation
- **Impact tracking** → Real-time database updates, no JSON file maintenance
- **Status coordination** → Database-driven instead of file-based coordination logs

### Legacy System Retirement
- **Remove** `.kiro/communication/coordination-log.json` (replace with database queries)
- **Remove** `claude-plans/impact-tracking.json` (replace with `api_wf.plan_impacts`)
- **Archive** file-based coordination patterns
- **Unified workflow** → Database as single source of truth

### Document Creation Domain Boundaries
Clear responsibility divisions to eliminate coordination overhead:

**1. Plan Creation** → **User Domain**
- User creates plans via Architecture Dashboard UI
- Auto-stored in `api_wf.plans` + markdown file generation

**2. Plan Guidance & Requirements** → **Claude Domain**  
- Claude provides architectural analysis and implementation guidance
- Investigation guides, code references, discovery checklists

**3. Issues** → **Hybrid Domain (User-Submitted)**
- Claude identifies issues but User formally submits them
- User enters issues via Communication interface → `api_wf.communications`
- Ensures User maintains control over issue prioritization

**4. Specs (design.md, requirements.md, tasks.md)** → **Kiro Domain**
- Kiro creates all implementation specifications  
- Lives in `.kiro/specs/[plan]/` structure
- Synced to database via document-update.js automation

## Implementation Pattern
```javascript
const handleCreatePlan = async (planData) => {
  // 1. Create the .md file
  await createPlanFile(planData);
  
  // 2. Automatically call the script  
  await execScript('document-update.js', '--create', '--type=plan', '--plan-id=19', '--by=user');
  
  // 3. User sees completed plan with database sync
};
```

## Integration Points
- **Architecture Dashboard** - Plan creation with automatic database sync
- **Issue Management** - Issue creation with automatic tracking
- **Document Editors** - Save operations trigger database updates
- **Plan Tools** - CLI tools enhanced with automatic database integration

## Technical Implementation Guidance

### Database Integration Patterns

**Query Operations** (using execEvent):
```javascript
// Get all active plans
await execEvent('planList');  // No parameters needed

// Get plan impacts for specific plan
setParameter('planId', 19);
await execEvent('planImpactList');

// Get communications for specific plan  
setParameter('planId', 19);
await execEvent('communicationList');

// Get documents for specific plan
setParameter('planId', 19); 
await execEvent('planDocumentList');
```

**DML Operations** (using execDml with formData/configDML):
```javascript
// Create new plan (follows existing CRUD pattern)
const formData = {
  cluster: 'DEVTOOLS',
  name: 'Planning Enhancements', 
  description: 'Database-first planning system',
  status: 'active',
  priority: 'high'
};

const configDML = {
  table: 'api_wf.plans',
  operation: 'INSERT',
  auditFields: true  // Auto-inject created_at/by, updated_at/by
};

await execDml({ formData, configDML });

// Update plan status
const formData = { status: 'completed' };
const configDML = {
  table: 'api_wf.plans', 
  operation: 'UPDATE',
  where: { id: planId },
  auditFields: true
};
```

**Document-Update.js Integration**:
```javascript
// After successful DML operation
const scriptResult = await executeScript('document-update.js', [
  '--create', 
  '--type=plan', 
  '--plan-id=' + planId,
  '--by=user'
]);
```

### Parameter Management
Use `setParameter()` before data fetching:
- `planId` - For plan-specific queries
- `communicationType` - Filter communications
- `status` - Filter by plan status
- `cluster` - Filter by plan cluster

## Dependencies
- **Requires**: Plan 0018 completion (universal document-update script)
- **Builds on**: Established document creation domains and database integration
- **Enables**: Seamless user experience with transparent database operations
