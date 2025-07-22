# Design Document

## Overview

Plan 0013 addresses a critical blocking issue for Plan 0011 by fixing the parent key field configuration logic in genDirectives.js. The current implementation incorrectly assigns `type: "select"` to parent key fields, preventing proper form data collection and causing DML operations to fail due to missing required fields like account_id.

## Architecture

### Current Problem
```javascript
// Current (incorrect) behavior in genDirectives.js
if (field.parentKey) {
  fieldConfig.type = "select"; // ❌ Wrong!
}
```

### Required Solution
```javascript
// Required (correct) behavior
if (field.parentKey) {
  fieldConfig.type = "number";    // ✅ Correct data type
  fieldConfig.required = true;    // ✅ Always required
  fieldConfig.hidden = true;      // ✅ Hidden from user
}
```

## Components and Interfaces

### 1. genDirectives.js Enhancement
**Location:** `packages/devtools/src/automation/page/genDirectives.js`

**Current Logic Issue:**
- Parent key fields incorrectly get `type: "select"`
- Missing required field enforcement
- Missing hidden field configuration

**Required Changes:**
- Detect `parentKey: true` fields
- Apply correct type, required, and hidden properties
- Preserve existing manual customizations

### 2. ARCHITECTURE-RULES.md Documentation
**Location:** `docs/ARCHITECTURE-RULES.md` (or create if missing)

**New Section Required:**
```markdown
## [PARENT-KEY-FIELDS] Parent Key Configuration Rules

### Purpose
Parent key fields (acctID, userID, etc.) establish hierarchical relationships and data integrity constraints.

### Required Configuration
- type: "number" (always)
- required: true (always) 
- hidden: true (always)

### Detection Logic
Fields with `parentKey: true` in view definitions are automatically configured with these rules.

### Examples
```json
{
  "field": "acctID",
  "parentKey": true,
  "type": "number",
  "required": true,
  "hidden": true
}
```
```

### 3. Directive Regeneration Process
**Target Files:** All view directives with parent key fields
**Common Fields:** acctID, userID, prodTypeID, ingrTypeID, etc.

**Process:**
1. Identify all directives with parentKey fields
2. Run genDirectives.js with fixed logic
3. Verify preservation of manual customizations
4. Test generation stability (no changes on second run)

## Data Models

### Parent Key Field Configuration
```typescript
interface ParentKeyField {
  field: string;           // Field name (e.g., "acctID")
  parentKey: boolean;      // Always true for parent keys
  type: "number";          // Always number for parent keys
  required: boolean;       // Always true for parent keys
  hidden: boolean;         // Always true for parent keys
  label?: string;          // Optional display label
  defaultValue?: number;   // Optional default value
}
```

### Form Data Structure
```typescript
interface FormData {
  [key: string]: any;
  acctID: number;          // Required parent key
  userID?: number;         // Optional parent key
  // ... other fields
}
```

## Error Handling

### Detection Errors
- **Missing parentKey property:** Log warning, continue processing
- **Invalid field configuration:** Log error, apply default rules
- **Conflicting manual overrides:** Preserve manual settings, log warning

### Generation Errors
- **File write failures:** Log error, continue with other files
- **Backup creation failures:** Log warning, continue generation
- **Validation failures:** Log error, report affected files

## Testing Strategy

### Unit Testing
1. **Parent Key Detection:** Test identification of parentKey fields
2. **Rule Application:** Test correct property assignment
3. **Preservation Logic:** Test manual customization preservation
4. **Edge Cases:** Test missing properties, invalid configurations

### Integration Testing
1. **Directive Generation:** Test complete generation process
2. **Form Rendering:** Test generated forms produce correct HTML
3. **DML Integration:** Test form data includes parent key values
4. **Plan 0011 Unblocking:** Test DML operations succeed with proper parent keys

### Validation Testing
1. **Configuration Verification:** Check all parent key fields have correct properties
2. **Stability Testing:** Verify no changes on second generation run
3. **Regression Testing:** Ensure existing functionality remains intact
4. **End-to-End Testing:** Test complete form → DML → database flow