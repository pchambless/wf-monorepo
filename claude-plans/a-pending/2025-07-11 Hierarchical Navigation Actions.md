# Hierarchical Navigation Actions - Eye Icon Implementation

## User Idea
The auto-generated hierarchical navigation actions (eye icons) are appearing in the CRUD tables but not functioning yet. When clicking the "View [childEntity]" button, it should navigate to the child entity page with the correct parameters, but currently it's just producing lots of debug logs without navigation.

## Current Issue
Example: ingrTypeList has a "View ingrList" action that should navigate to `/ingredients/:ingrTypeID/ingrList` with the selected row's ingrTypeID value.

Generated action structure:
```javascript
{
  "id": "navigate",
  "icon": "Visibility", 
  "color": "primary",
  "tooltip": "View ingrList",
  "route": "/ingredients/:ingrTypeID/ingrList",
  "paramField": "ingrTypeID"
}
```

The logs show CrudLayout is mounting correctly and forms are initializing, but the actual navigation isn't happening.

## Implementation Impact Analysis

### Impact Summary
- **Files**: 8 (see impact-tracking.json: plan_id="2025-07-11-hierarchical-navigation")
- **Complexity**: Medium (navigation routing, parameter passing)
- **Packages**: apps/wf-client (4), packages/shared-imports (1), packages/devtools (3)
- **Blast Radius**: NAVIGATION (medium), DEVTOOLS (medium)

### Impact Tracking Status
- **Predicted**: 8 files
- **Actual**: 8 files (+0 discovered)
- **Accuracy**: 100%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: None identified
- **Blocked by**: None
- **Related**: 2025-.07-08 Select Widget params (parameter auto-lookup)
- **File Conflicts**: None identified

### Root Cause Analysis
- Navigation actions are generated correctly
- Eye icons appear in tables as expected
- Click handlers are missing or not properly wired
- Parameter extraction from selected rows needs implementation
- Navigation service may need route parameter interpolation