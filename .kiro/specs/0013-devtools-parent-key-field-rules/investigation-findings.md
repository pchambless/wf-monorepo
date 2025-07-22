# Architecture Investigation Findings

## Current Architecture Analysis

### 1. DirectiveMap.js System Review

**Location:** `packages/devtools/src/utils/directiveMap.js`

**Key Features:**
- Comprehensive directive mapping system with `processDirectives()` API
- Supports `parentKey` directive with proper transformation: `transform: () => true`
- Includes business rules for system fields, BI fields, and field types
- Has built-in logic for parent key handling but **NOT CURRENTLY INTEGRATED** with genDirectives.js

**Parent Key Support in DirectiveMap:**
```javascript
"parentKey": {
    transform: () => true,
    description: "Parent reference field"
}
```

**Business Rules Applied:**
- System fields (`sys: true`) automatically get `editable: false`, `tableHide: true`, `formHide: true`
- No specific business rules for `parentKey` fields currently implemented

### 2. GenDirectives.js Current Logic Analysis

**Location:** `packages/devtools/src/automation/triggered/genDirectives.js`

**Current Parent Key Logic:**
```javascript
// Line 261: Parent key detection
if (fieldName === viewKeys.parentKey) return { parentKey: true, sys: true, type: 'number' };
```

**Issues Identified:**

1. **Missing Required Field:** Parent key fields are not marked as `required: true`
2. **Missing Hidden Field:** Parent key fields are not marked as `hidden: true`  
3. **No DirectiveMap Integration:** genDirectives.js has its own hardcoded logic instead of using directiveMap.processDirectives()
4. **Inconsistent Business Rules:** System field handling differs between directiveMap.js and genDirectives.js

**Current System Field Processing:**
```javascript
// applySmartRules function (line 304)
if (directives.sys || directives.PK || directives.parentKey) {
    // Set label to fieldName for debugging
    if (fieldName) {
        directives.label = fieldName;
    }
    // Remove unnecessary attributes for sys fields
    delete directives.width;
    delete directives.grp;
    delete directives.tableHide;  // ❌ Should be true for parent keys
    delete directives.formHide;   // ❌ Should be true for parent keys
    // Don't set any hide attributes - let widgets handle it
    return directives;
}
```

### 3. Integration Points Identified

**Primary Integration Point:**
- `inferDirectivesFromSQL()` function (line 254) - where parent key detection occurs
- `applySmartRules()` function (line 302) - where system field rules are applied

**Required Changes:**
1. Import `processDirectives` from directiveMap.js
2. Replace hardcoded parent key logic with directiveMap calls
3. Ensure parent key fields get proper configuration: `type: "number"`, `required: true`, `hidden: true`

### 4. Current Parent Key Logic Flow

**Step 1: Field Detection**
```javascript
// VIEW_KEY_MAP defines parent keys for each view
const viewKeys = getViewKeys(viewName);
if (fieldName === viewKeys.parentKey) return { parentKey: true, sys: true, type: 'number' };
```

**Step 2: System Field Processing**
```javascript
// applySmartRules removes hide attributes instead of setting them
if (directives.parentKey) {
    delete directives.tableHide;  // ❌ WRONG - should be true
    delete directives.formHide;   // ❌ WRONG - should be true  
}
```

**Step 3: Missing Required Logic**
- No logic to set `required: true` for parent key fields
- No logic to set `hidden: true` for parent key fields

### 5. Parent Key Field Examples from SQL Views

**vndrList.sql:**
```sql
a.account_id AS acctID  -- Parent key field
```

**ingrList.sql:**
```sql
a.ingredient_type_id AS ingrTypeID,  -- Parent key field
a.account_id AS acctID               -- Parent key field
```

**VIEW_KEY_MAP Configuration:**
```javascript
'vndrList': {
    primaryKey: 'vndrID',
    parentKey: 'acctID'      // Maps to account_id column
},
'ingrList': {
    primaryKey: 'ingrID', 
    parentKey: 'ingrTypeID'  // Maps to ingredient_type_id column
}
```

### 6. Compatibility Requirements

**Backward Compatibility:**
- Preserve existing manual customizations (label, width, grp)
- Maintain existing field detection logic
- Keep VIEW_KEY_MAP structure intact

**Integration Requirements:**
- Import directiveMap.js without breaking existing functionality
- Ensure processDirectives() API works with current field structure
- Maintain three-tier field categorization (direct, joined, computed)

## Fix Points Identified

### 1. Missing DirectiveMap Integration
- genDirectives.js should use `processDirectives()` instead of hardcoded logic
- Business rules should be centralized in directiveMap.js

### 2. Incorrect Parent Key Configuration
**Current (Wrong):**
```javascript
{ parentKey: true, sys: true, type: 'number' }
// After applySmartRules: removes tableHide and formHide
```

**Required (Correct):**
```javascript
{ 
    parentKey: true, 
    type: 'number', 
    required: true, 
    hidden: true 
}
```

### 3. Business Rules Gap
DirectiveMap.js needs enhanced business rules for parent key fields:
```javascript
// Required addition to processDirectives()
if (result.parentKey) {
    result.type = 'number';
    result.required = true;
    result.hidden = true;
}
```

### 4. System Field Inconsistency
- directiveMap.js: `sys: true` → `tableHide: true, formHide: true`
- genDirectives.js: `sys: true` → removes hide attributes
- Need to align both systems

## Next Steps for Integration

1. **Enhance DirectiveMap Business Rules** - Add parent key specific rules
2. **Import DirectiveMap into GenDirectives** - Replace hardcoded logic
3. **Update Parent Key Processing** - Use processDirectives() API
4. **Test Integration** - Ensure backward compatibility
5. **Regenerate Affected Directives** - Apply fixes to all parent key fields

## Requirements Mapping

- **Requirement 1.1:** Fix parent key type assignment ✅ Identified in inferDirectivesFromSQL()
- **Requirement 1.2:** Add required: true ❌ Missing logic
- **Requirement 1.3:** Add hidden: true ❌ Missing logic  
- **Requirement 1.4:** Remove type: "select" ✅ Not currently assigned to parent keys