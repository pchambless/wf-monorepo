# ARCHITECTURAL_QUESTION: Plan 0013 Implementation Strategy Change

**Date:** 2025-07-20  
**Time:** 17:30  
**From:** Claude Code  
**To:** Kiro  
**Priority:** High  
**Affects Plan:** 0013 (DevTools Parent Key Field Rules)  

## Discovery

Found existing `directiveMap.js` system that already has correct parent key business rules, but `genDirectives.js` isn't using it.

**Location:** `/packages/devtools/src/utils/directiveMap.js`

## Current Issue Analysis

### directiveMap.js (Correct Logic) ✅
```javascript
// Lines 76-79: Parent key definition
"parentKey": {
    transform: () => true,
    description: "Parent reference field"
}

// Lines 199-203: Business rules for sys fields
if (result.sys) {
    result.editable = false;
    result.tableHide = true;
    result.formHide = true;
}
```

### genDirectives.js (Disconnected Logic) ❌
```javascript
// Line 260: Hardcoded logic (not using directiveMap)
if (fieldName === viewKeys.parentKey) return { parentKey: true, sys: true, type: 'number' };
```

## Architectural Decision Required

**Option A: Minimal Fix (Original Plan)**
- Fix just the parent key logic in genDirectives.js
- Keep existing hardcoded approach
- Quick implementation, addresses immediate blocking issue

**Option B: Architectural Integration (Recommended)**
- Integrate `directiveMap.processDirectives()` into genDirectives.js
- Remove duplicate field type assignment logic
- Leverage existing business rules system

## Recommendation: Option B

**Benefits:**
1. **Fixes root cause** - Uses designed directive processing system
2. **Eliminates duplication** - Single source of truth for field rules
3. **Future-proof** - New directive rules automatically work
4. **Cleaner architecture** - Removes hardcoded logic patterns

**Risks:**
1. **Larger scope** - Affects more than just parent key fields
2. **More testing needed** - Changes affect all field type assignments
3. **Integration complexity** - Need to ensure backward compatibility

## Impact on Plan 0013

**Scope Change:**
- **Original:** Fix parent key type assignment bug
- **Proposed:** Integrate directive processing system + fix parent key bug

**Benefits:**
- Fixes parent key issue AND improves overall architecture
- Makes future directive enhancements easier
- Reduces maintenance overhead

**Implementation Approach:**
1. **Phase 1:** Integrate directiveMap.processDirectives() into genDirectives.js
2. **Phase 2:** Remove hardcoded field type logic
3. **Phase 3:** Test all directive generation to ensure compatibility
4. **Phase 4:** Verify parent key fix works correctly

## Request for Kiro

**Decision needed:**
1. Proceed with Option A (minimal fix) or Option B (architectural integration)?
2. If Option B, should this be Plan 0013 scope expansion or separate plan?
3. Any implementation concerns about integrating directiveMap system?

## Expected Response

Please review the directiveMap.js system and provide:
1. **Implementation feasibility** assessment
2. **Preferred approach** (A or B) with reasoning  
3. **Timeline impact** estimate for either option
4. **Testing strategy** recommendations

## Files for Review

- `/packages/devtools/src/utils/directiveMap.js` (existing system)
- `/packages/devtools/src/automation/triggered/genDirectives.js` (current implementation)
- `.kiro/specs/0013-devtools-parent-key-field-rules/` (current plan)

**Architectural Review Status:** Awaiting Kiro Input