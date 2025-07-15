# Directive Preservation Logic

## Overview
The DevTools automation system preserves manual customizations during regeneration to prevent loss of UI tuning work.

## Preserved Attributes

### Form Organization
- **`grp`** - Group assignments for form layout (e.g., `"grp": "1"`, `"grp": 4`)
- **`width`** - Column widths for tables (e.g., `"width": "200"`, `"width": 120`)

### Widget Assignments
- **`widget`** - Select widget assignments (e.g., `"widget": "SelMeas"`, `"widget": "SelVndr"`)
- **`label`** - Custom field labels (e.g., `"label": "Default Measure"`)

### Visibility Controls
- **`tableHide`** - Hide fields from table view
- **`formHide`** - Hide fields from form view
- **`required`** - Mark fields as required in forms

## How Preservation Works

### 1. Read Existing Directives
Before regeneration, `genDirectives.js` reads existing directive files from:
```
/automation/data/directives/[viewName].json
```

### 2. Merge Logic
- **System attributes** (PK, sys, type, dbColumn) are always regenerated
- **Manual customizations** (grp, width, widget, label) are preserved
- **New fields** get default values
- **Removed fields** are cleaned up

### 3. Validation
Run `genDirectives.js` twice on same view to verify:
- Only `lastGenerated` timestamp changes
- All manual customizations remain intact

## Commands

### Test Preservation
```bash
# Generate directives for a view
node src/automation/triggered/genDirectives.js ingrList

# Re-run to verify preservation
node src/automation/triggered/genDirectives.js ingrList
```

### Unified Entry Points
```bash
# Run all core generators
node src/automation/runCore.js

# Run triggered generators for specific view
node src/automation/runTriggered.js ingrList
```

## Best Practices

1. **Always test preservation** after modifying genDirectives.js
2. **Use unified entry points** for consistent execution
3. **Manual customizations** should be done in directive files, not source SQL
4. **Backup directive files** before major regenerations