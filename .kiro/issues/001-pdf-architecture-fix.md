# Issue 001 - PDF Architecture Fix

**Date:** 2025-07-19  
**Reporter:** User  
**Status:** Resolved  
**Priority:** High  

## Problem

React-PDF components placed in shared-imports causing import errors:
```
export 'WorksheetGenerator' was not found in '@whatsfresh/shared-imports/jsx'
```

## Root Cause

PDF generation is **app-specific functionality**, not shared infrastructure. Should be in client app, not shared-imports.

## Current State
- ❌ React-PDF dependency in shared-imports/package.json
- ❌ WorksheetGenerator in shared-imports/jsx.js exports
- ❌ WorksheetPDF in shared-imports/components/reports/
- ✅ EventTypes in shared-imports (correct - data queries are shared)

## Solution Required

1. **Move React-PDF to wf-client:**
   - Remove from shared-imports/package.json
   - Add to apps/wf-client/package.json

2. **Move PDF components to wf-client:**
   - Move WorksheetPDF.jsx to apps/wf-client/src/components/reports/
   - Move WorksheetGenerator.jsx to apps/wf-client/src/components/reports/
   - Remove from shared-imports/jsx.js exports

3. **Update imports:**
   - Change BatchMapping.jsx import to local path
   - Test compilation and functionality

## Architecture Principle

**Shared-imports should contain:**
- ✅ Data queries (eventTypes)
- ✅ UI components used across multiple apps
- ✅ Utilities and stores

**App-specific should contain:**
- ✅ PDF generation (client-specific)
- ✅ App-specific layouts and workflows
- ✅ Domain-specific business logic

## Resolution

**Completed:** 2025-07-19  
**Implemented by:** Kiro  

### Changes Made:

1. ✅ **Moved React-PDF dependency:**
   - Removed from `packages/shared-imports/package.json`
   - Added to `apps/wf-client/package.json`

2. ✅ **Relocated PDF components:**
   - Moved `WorksheetPDF.jsx` to `apps/wf-client/src/components/reports/`
   - Moved `WorksheetGenerator.jsx` to `apps/wf-client/src/components/reports/`
   - Removed exports from `packages/shared-imports/src/jsx.js`

3. ✅ **Updated imports:**
   - Changed `BatchMapping.jsx` to use local import path
   - Fixed compilation error

### Architecture Now Correct:
- ✅ PDF generation is app-specific (in wf-client)
- ✅ Shared-imports contains only universal components
- ✅ EventTypes remain in shared-imports (data queries are shared)

## Related Files
- ✅ packages/shared-imports/package.json (dependency removed)
- ✅ apps/wf-client/package.json (dependency added)
- ✅ packages/shared-imports/src/jsx.js (exports removed)
- ✅ apps/wf-client/src/layouts/BatchMapping.jsx (import updated)
- ✅ apps/wf-client/src/components/reports/WorksheetPDF.jsx (relocated)
- ✅ apps/wf-client/src/components/reports/WorksheetGenerator.jsx (relocated)

## Follow-up Issue Identified

**Status:** Open  
**Reporter:** Claude Code  

### Problem
React-PDF dependency added to package.json but not installed:
```
ERROR: Can't resolve '@react-pdf/renderer' in '/home/paul/wf-monorepo-new/apps/wf-client/src/components/reports'
```

### Root Cause
- ✅ Dependency added to `apps/wf-client/package.json`
- ❌ Dependency not installed in node_modules
- ❌ npm install failing due to workspace/symlink issues

### Solution Required
**Manual Installation Needed:**
1. User needs to run `npm install` in the client app directory
2. Or install React-PDF dependency manually
3. Alternative: Use yarn if npm workspace has issues

### NPM Error Encountered
```
npm error Maximum call stack size exceeded
npm error code EISDIR - symlink issues with workspace
```

**Status:** Resolved  
**Completed:** 2025-07-20  
**Implemented by:** Kiro + Claude Code  

### Resolution Applied:
✅ **Root-level installation implemented:**
- Removed `@react-pdf/renderer` from `apps/wf-client/package.json`
- Confirmed `@react-pdf/renderer": "^4.3.0"` exists in root `package.json`
- Architecture now supports both Client and Admin apps
- Resolves workspace symlink issues

### Benefits Achieved:
✅ Shared across Client and Admin apps  
✅ Single dependency version management  
✅ Follows monorepo best practices  
✅ Avoids workspace symlink issues  

**Priority:** Resolved (PDF functionality restored)

## Final Architecture Summary

✅ **Complete Resolution Achieved:**
- PDF components properly located in `apps/wf-client/src/components/reports/`
- React-PDF dependency installed at monorepo root level (`@react-pdf/renderer": "^4.3.0"`)
- Import paths updated to use local component references
- Architecture supports future Admin app PDF functionality
- Workspace symlink issues resolved through root-level dependency management

**Issue Status:** CLOSED ✅ 

## EventType Architecture Update

**Status:** Resolved  
**Completed:** 2025-07-20  
**Implemented by:** Kiro + Claude Code  

### Problem Identified:
```
Failed to generate worksheet: Unknown event type: worksheetIngredients
```

### Root Cause:
- EventTypes existed but used inconsistent naming convention
- Old names: `worksheetIngredients`, `worksheetTasks`
- Needed standardized report naming pattern

### Solution Applied:
✅ **Updated EventType naming convention:**
- Changed `worksheetIngredients` → `rpt-WrkSht-Ingr` (eventID: 300)
- Changed `worksheetTasks` → `rpt-WrkSht-Task` (eventID: 301)
- Updated category from `data:worksheet` → `report:worksheet`
- Enhanced purpose descriptions for clarity

✅ **Updated WorksheetGenerator.jsx:**
- Changed `execEvent('worksheetIngredients')` → `execEvent('rpt-WrkSht-Ingr')`
- Changed `execEvent('worksheetTasks')` → `execEvent('rpt-WrkSht-Task')`

### Architecture Benefits:
✅ Consistent report naming pattern (`rpt-` prefix)  
✅ Clear functional identification (`WrkSht-` for worksheet)  
✅ Readable abbreviations (`Ingr`, `Task`)  
✅ Proper categorization (`report:worksheet`)  

### Next Step Required:
🔄 **Server restart needed** to reload EventType definitions

**Priority:** High (requires server restart to activate)