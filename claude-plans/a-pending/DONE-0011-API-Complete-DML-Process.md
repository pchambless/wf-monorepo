# API - Complete DML Process

## Claude Warm-Up Hint

Session context: Plan 0011  
Reference plan file: `0011-API-Complete-DML-Process.md`  
Goal: Build and integrate `execDML` API endpoint  
Use logic from `dmlBuilder.js` and `sqlFormatter.js` for SQL previews and payload shaping  
Avoid regenerating formatting or mapping logic  
Coordinate module edits as atomic blocks  

## User Idea

This plan will build out the DML processing across the Client and Server.

We currently have, in the CRUD processes, an **UPDATE button** that generates the data required for DML processing. This data is presented in a modal preview to help review what the update operation would look like before submission.

**Modal Preview UPDATE Example:**

**SQL Preview:**
```sql
  UPDATE ingredient_types
  SET name = 'Produce'
  , description = 'Fresh Produce'
  , account_id = 1
  WHERE id = 3
```
**DML Data Structure**
```JSON
{
  "method": "UPDATE",
  "table": "ingredient_types",
  "data": {
    "id": 3,
    "name": "Produce",
    "description": "Fresh Produce",
    "account_id": 1
  },
  "primaryKey": "ingrTypeID"
}
```
**Form Data (with context)**
```JSON
{
  "ingrTypeID": 3,
  "ingrTypeName": "Produce",
  "ingrTypeDesc": "Fresh Produce",
  "acctID": 1
}
```
## Over Arching Concept

We will have an API request 'execDML'.  We will pass The necessary info for the server to build the DML that will update the database table with the request.

## SERVER Consederations  

Much like the /home/paul/wf-monorepo-new/apps/wf-server/server/controller/execEventType.js controller, the execDML controller will need to resolve the column values and build the request.  either INSERT, UPDATE or DELETE.  We may be able to use the /home/paul/wf-monorepo-new/apps/wf-server/server/utils/queryResolver.js, to build the DML statement, or we may need a different method.  

## CLIENT / ADMIN Considerations

There is a shareable API module that is intended to be used by both the Client and Admin apps.  See Existing Module References.

## Delete Special Case

The Database has referential integrity built in.  
1.  Row has no dependancies:  Proceed with a true DELETE statement.
2.  Row has dependancies:  If an initial DELETE request returns a referential integrity error  
    - Perform a soft delete — update deleted_at column with currentTimestamp.

## Existing Module References

The following modules provide core logic for this plan and should be leveraged or extended as part of implementation:

- **SQL Formatting Utilities**  
  _Path:_ `/home/paul/wf-monorepo-new/packages/shared-imports/src/utils/dml/sqlFormatter.js`  
  _Purpose:_ Provides pure functions for formatting literal values and generating SQL statements for INSERT, UPDATE, and DELETE operations

- **DML Payload & SQL Preview Builder**  
  _Path:_ `/home/paul/wf-monorepo-new/packages/shared-imports/src/utils/dml/dmlBuilder.js`  
  _Purpose:_ Translates form data and page configuration (`pageMap.configDML`) into structured DML payloads and SQL preview strings for DML operations.

  **Shareable API module (execDML at bottom)**
  _Path:_  /home/paul/wf-monorepo-new/packages/shared-imports/src/api/index.js
  _Purpose:_ Presents the interface to the server with API calls.  The execDML request has never been used and was built using old strategies... I'm sure it will need work.

These modules will inform both client-side preview construction and server-side DML execution logic (e.g. within `execDML.js`). My hope is that we can utilize the code for formatting the DML requests.  


## Implementation Impact Analysis

**User Analysis Thinking**
- Crud Form / Presenter Impact - Folder:  /home/paul/wf-monorepo-new/packages/shared-imports/src/components/crud/Form
- BatchMapping page impact:  Invokes execDML during drag-and-drop actions:  This may be tied in to the /home/paul/wf-monorepo-new/apps/wf-client/src/layouts/BatchMapping.jsx
- Future:  Shopping Page.  

### Impact Summary
- **Plan ID**: 0011
- **Files**: TBD (see impact-tracking.json: plan_id="0011")
- **Complexity**: TBD (High|Medium|Low)
- **Packages**: TBD (package names and file counts)
- **Blast Radius**: API (high)

### Impact Tracking Status
- **Predicted**: TBD files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: [List plans that can't proceed until this is done]
- **Blocked by**: [List plans that must complete first]
- **Related**: [List plans with overlapping scope]
- **File Conflicts**: [Specific files being modified by multiple plans]

## Investigation Results

### Current State Analysis

**✅ Client-Side Infrastructure (Complete)**
- `dmlBuilder.js` - Transforms pageMap + formData → DML operations + SQL previews
- `sqlFormatter.js` - Pure functions for SQL generation (INSERT/UPDATE/DELETE) 
- `dmlPreview.jsx` - Modal UI for DML preview with user confirmation
- `operations.js` - Unified DML execution with parameter resolution via contextStore
- API client with `execDml()` method ready but pointing to non-existent `/api/dml` endpoint

**❌ Server-Side Missing**
- No `execDML` controller exists in `/apps/wf-server/server/controller/`
- No `/api/dml` route registered in `registerRoutes.js`
- Existing pattern: `execEventType.js` uses `queryResolver.js` + `dbUtils.js` for SQL execution

**✅ Database Schema (Audit Trail + Soft Delete Ready)**
- All tables have 6 audit columns: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`
- Computed `active` field: `'Y'` when `deleted_at` IS NULL, empty otherwise
- Foreign key constraints: `ON DELETE NO ACTION` (will throw referential integrity errors as expected)
- **DML Requirements**: Must auto-populate audit fields with `NOW()` + `userID` from contextStore

**🔧 API Integration Ready**
- Client API module has `execDml()` function expecting `/api/dml` endpoint
- Modal preview system shows SQL + DML data structure before execution
- Parameter resolution unified through contextStore (auto-resolves userID, acctID, etc.)

### Implementation Strategy

**Phase 1: Core Server Implementation**
1. Create `execDML.js` controller following `execEventType.js` pattern
2. Add `/api/execDML` route to `registerRoutes.js`
3. Implement DML execution using existing `dbUtils.js` infrastructure
4. **Auto-inject audit fields in SQL**: 
   - INSERT: `created_at = NOW(), created_by = :userID`
   - UPDATE: `updated_at = NOW(), updated_by = :userID`
   - DELETE (soft): `deleted_at = NOW(), deleted_by = :userID`

**Phase 2: Soft Delete Logic**
1. Try DELETE operation first
2. Catch referential integrity errors (MySQL error codes 1451/1452)
3. Fall back to soft delete: UPDATE with audit trail

**Phase 3: Client Integration**
1. Update API endpoint from `/api/dml` to `/api/execDML` for consistency
2. Test modal preview → server execution flow
3. Verify contextStore parameter resolution

## Implementation Impact Analysis

### Impact Summary
- **Files**: 3 (see impact-tracking.json: plan_id="0011")
- **Complexity**: Medium
- **Packages**: apps/wf-server (2), packages/shared-imports (1)
- **Blast Radius**: API (high)

### Impact Tracking Status
- **Predicted**: 3 files
- **Actual**: TBD files (+X discovered)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: BatchMapping DML operations, Shopping Page DML
- **Blocked by**: None (infrastructure complete)
- **Related**: None identified
- **File Conflicts**: None (new controller + route registration)

## Implementation Status: COMPLETED ✅

### ✅ **Server-Side Implementation Complete**
1. **execDML controller created** - `apps/wf-server/server/controller/execDML.js` with full DML logic + audit field injection
2. **Route registered** - `/api/execDML` route active in `registerRoutes.js`
3. **DML processor implemented** - `apps/wf-server/server/utils/dml/dmlProcessor.js` with audit field auto-injection
4. **Soft delete handling complete** - Catches referential integrity (codes 1451/1452), falls back to soft delete
5. **Database audit trail** - Auto-populates `created_at/by`, `updated_at/by`, `deleted_at/by` with `userID` from context

### ✅ **Client-Side Integration Complete**
1. **API client ready** - `packages/shared-imports/src/api/index.js` has `execDml()` method pointing to `/api/execDML`
2. **FormStore updated** - Removed non-existent imports (`insertRecord`, `updateRecord`, `deleteRecord`)
3. **New DML integration** - FormStore now uses `api.execDml()` with proper payload structure
4. **Context integration** - Auto-resolves `userID` from `contextStore` for audit trail

### ✅ **Architecture Validated**
- **Client Flow**: FormStore → `api.execDml()` → `/api/execDML` endpoint
- **Server Flow**: `execDML.js` controller → `dmlProcessor.js` → SQL execution with audit trail
- **Database**: All tables have audit columns ready for auto-population
- **Error Handling**: Referential integrity errors trigger soft delete fallback
- **Parameter Resolution**: Context data (userID, acctID) auto-resolved via contextStore

## Plan Status: READY FOR COMPLETION
- All implementation requirements met
- Architecture properly integrated
- Ready for end-to-end testing and plan closure
