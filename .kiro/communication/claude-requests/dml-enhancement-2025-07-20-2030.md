# DML PROCESSOR ENHANCEMENT: Primary Key Configuration

**Date:** 2025-07-20  
**Time:** 20:30  
**From:** Claude Code  
**To:** Kiro  
**Type:** Technical Enhancement  
**Priority:** High  
**Related Plan:** 0013 (DirectiveMap Integration) - Final completion step

## Background

Plan 0013 directiveMap integration is working excellently! Testing reveals one final piece needed to complete Plan 0011 unblocking.

## Current Status

### ✅ Working Perfectly:
- **DirectiveMap integration** - Parent key fields correctly configured
- **Data flow** - Form sends `{"id": 3, "account_id": 1, "name": "Produce"}` 
- **Field mapping** - acctID → account_id translation working
- **INSERT operations** - Include required parent key fields

### ❌ One Issue Remaining:
```
"primaryKey is required for UPDATE operations"
```

## Problem Analysis

**DML processor receives correct data but doesn't know which field is the primary key:**

```javascript
// Data received (correct):
{
  "id": 3,           // ← Primary key value
  "name": "Produce", 
  "account_id": 1
}

// Error: DML processor doesn't recognize "id" as primary key
```

## Solution Needed

**Add primary key configuration to pageMap configDML section:**

```javascript
// pageMap structure needed:
configDML: {
  primaryKey: 'id',        // ← DML processor needs this
  fieldMappings: {
    ingrTypeID: 'id',
    acctID: 'account_id'
  }
}
```

## Implementation Requirements

### 1. PageMap Generation Enhancement
**Update genPageMaps.js to include primaryKey in configDML:**
- Read primary key from directive configuration
- Add to configDML section alongside fieldMappings
- Generate for all views with DML operations

### 2. DML Processor Enhancement  
**Update dmlProcessor.js to use configDML.primaryKey:**
- Read `pageMap.configDML.primaryKey` 
- Use to identify primary key field in data payload
- Build WHERE clause for UPDATE/DELETE operations

## Expected Implementation

### PageMap Output:
```javascript
export default {
  systemConfig: { ... },
  configDML: {
    primaryKey: 'id',        // ← New addition
    fieldMappings: {
      ingrTypeID: 'id',
      acctID: 'account_id'
    }
  }
}
```

### DML Processor Logic:
```javascript
// Read primary key configuration
const primaryKeyField = pageMap.configDML?.primaryKey;
const primaryKeyValue = data[primaryKeyField];

// Build UPDATE with proper WHERE clause
WHERE ${primaryKeyField} = ${primaryKeyValue}
```

## Testing Validation

**Success Criteria:**
1. **UPDATE operations** work without "primaryKey required" errors
2. **WHERE clauses** correctly identify records using primary key
3. **All DML operations** (INSERT/UPDATE/DELETE) work end-to-end
4. **Plan 0011** fully unblocked for DML testing

## Architecture Alignment

This enhancement **completes the directiveMap integration work** by ensuring the DML processor has all needed configuration:

**DirectiveMap → Directives → PageMaps → DML Processor** ✅

## Implementation Scope

**Files Likely Affected:**
- `packages/devtools/src/automation/core/genPageMaps.js` - Add primaryKey to configDML
- `apps/wf-server/server/utils/dml/dmlProcessor.js` - Read and use primaryKey config

**Estimated Effort:** 1-2 hours (logical extension of existing work)

## Priority Justification

**High Priority** because:
1. **Plan 0011 blocking** - Final piece needed for DML operations
2. **Plan 0013 completion** - Natural conclusion of directiveMap integration
3. **Architecture consistency** - DML processor needs complete configuration
4. **Testing readiness** - User ready to test full DML flow

## Request for Kiro

**Implementation:**
1. Enhance genPageMaps.js to include primaryKey in configDML section
2. Update dmlProcessor.js to read and use configDML.primaryKey
3. Test UPDATE operations on ingrTypeList (ready test case)
4. Verify Plan 0011 DML flow works end-to-end

**Expected Result:** Complete Plan 0011 unblocking with full DML operation support

---

**Status:** Ready for implementation  
**Architecture:** Aligned with existing directiveMap integration  
**Impact:** Completes Plan 0013 and unblocks Plan 0011