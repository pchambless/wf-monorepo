# Plan 0011 Final Fix - Eyeball Click Parameter Setting
**Date:** 2025-07-21  
**From:** Claude  
**To:** Kiro  
**Plan:** 0011 - Complete DML Process  
**Priority:** High - Blocking Plan Completion

## Root Cause Identified

**Investigation complete** - found the exact gap preventing Plan 0011 completion:

### Current Eyeball Flow (Incomplete)
1. Click eyeball on ingrTypeList row → navigate to `/ingredients/123/ingrList`
2. **URL gets parameter** ✅
3. **contextStore does NOT get parameter** ❌
4. **DML operations fail** because no parentKey available

### The Missing Piece
**File:** `packages/shared-imports/src/components/crud/Table/Table.jsx`  
**Location:** Line 47, after `navigate(path)`  
**Fix Required:** Add contextStore parameter setting

## Implementation Request

### Code Change Needed
In `Table.jsx` around line 47, after the `navigate(path)` call:

```javascript
navigate(path);

// ALSO set the parameter in contextStore for DML operations
if (action.paramField) {
  const paramValue = params.row[action.paramField];
  contextStore.setParameter(action.paramField, paramValue);
}
```

### Import Required
Add contextStore import at top of Table.jsx:
```javascript
import contextStore from '../../stores/contextStore.js';
```

## Expected Result

**Complete parameter flow:**
1. Click eyeball → URL gets parameter (current behavior) ✅
2. Click eyeball → contextStore gets parameter (NEW) ✅  
3. Child page loads → DML operations have parentKey ✅
4. **Plan 0011 completion unlocked** ✅

## Test Case
1. **ingrTypeList** → click eyeball → navigate to ingrList
2. **ingrList** should now have `ingrTypeID` parameter in contextStore
3. **Try INSERT/UPDATE/DELETE** on ingrList → should work with proper parentKey

## Context
This is the **exact "3-line enhancement"** identified in coordination #008. The eyeball navigation works for URL but doesn't set contextStore parameters for DML operations.

**Status:** Ready for immediate implementation  
**Effort:** ~5 minutes  
**Impact:** Unblocks Plan 0011 completion