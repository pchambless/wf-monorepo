# Table Component PageMap Format Update

## Problem
The Table component (`/packages/shared-imports/src/components/crud/Table/Table.jsx`) is still using the old `pageMap.columnMap` format, but the new pageMap structure uses `tableConfig.columns`.

## Error Details
```
Cannot read properties of undefined (reading 'columnMap')
TypeError: Cannot read properties of undefined (reading 'columnMap')
    at Table.jsx:24
```

## Current vs New PageMap Structure

### Old Format (what Table expects):
```javascript
pageMap.columnMap = [
  { field: 'ingrTypeID', hideInTable: false, system: false },
  { field: 'ingrTypeDesc', hideInTable: false, system: false }
]
```

### New Format (what we have):
```javascript
pageMap.tableConfig.columns = [
  { field: 'ingrTypeID', hidden: true, editable: false },
  { field: 'ingrTypeDesc', hidden: false, editable: true }
]
```

## Files to Update

### 1. Table Component
**File:** `/packages/shared-imports/src/components/crud/Table/Table.jsx`

**Changes needed:**
- Line 24: Change `pageMap.columnMap` to `pageMap.tableConfig.columns`
- Line 29: Change `pageMap.columnMap` to `pageMap.tableConfig.columns`
- Update property names:
  - `hideInTable` → `hidden`
  - `system` → remove (not used in new format)
- Update filtering logic for new structure

### 2. Form Component
**File:** `/packages/shared-imports/src/components/crud/Form/Form.jsx`

**Likely changes needed:**
- Check if Form component also uses `columnMap` or old format
- Update to use `pageMap.formConfig.groups[].fields[]` structure

### 3. CrudLayout Component
**File:** `/packages/shared-imports/src/components/crud/CrudLayout/CrudLayout.jsx`

**Changes needed:**
- Verify pageMap structure validation
- Ensure proper passing of config objects to Table and Form

## Implementation Steps

### Step 1: Update Table Component
1. Replace `pageMap.columnMap` with `pageMap.tableConfig.columns`
2. Update property mappings:
   ```javascript
   // Old
   .filter(col => !col.hideInTable && !col.system)
   
   // New
   .filter(col => !col.hidden)
   ```
3. Update actions column detection logic
4. Test with ingrTypeList pageMap

### Step 2: Update Form Component
1. Check current Form implementation
2. Update to use `pageMap.formConfig.groups[].fields[]`
3. Map field properties correctly

### Step 3: Verify Other Components
1. Check if any other components use old pageMap format
2. Update import paths if needed
3. Test all CRUD operations

## Testing Strategy

### Test Cases
1. **Table Rendering**: Verify ingredient types table displays correctly
2. **Column Configuration**: Check hidden/visible columns work
3. **Row Actions**: Verify edit/delete/view actions appear
4. **Form Rendering**: Test form displays when row selected
5. **Data Loading**: Confirm execEvent calls work with new parameters

### Test Pages
- `/ingredients/1/ingrTypeList` - Primary test case
- `/products/1/prodTypeList` - Secondary test case
- Other CRUD pages as needed

## Expected Outcomes
- Table component renders without errors
- Columns display according to `tableConfig.columns` configuration
- Form component works with new `formConfig` structure
- Full CRUD operations work on ingredient types page

## Rollback Plan
If issues arise:
1. Revert Table component changes
2. Consider creating adapter function to convert new format to old format
3. Update pageMap generation instead of components

## Notes
- This is a breaking change that affects all CRUD pages
- May need to update pageMap generation if format is inconsistent
- Consider creating migration utility for old pageMaps
- Test thoroughly before deploying to other entity types