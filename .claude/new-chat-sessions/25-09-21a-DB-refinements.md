WhatsFresh Hierarchy and Workflow Triggers - Session Summary

  🎯 Major Accomplishments

  1. Fixed /wf-hierarchy Command Issues

  - Problem: Original command used deprecated execDML approach that didn't work with stored procedures
  - Solution: Switched to execEventType with proper context store parameter passing
  - Key Discovery: Parameters need paramVal not value in setVals API calls
  - Result: /wf-hierarchy now works perfectly for any component ID

  2. Enhanced Stored Procedure with Formatting

  - Created: sp_hier_structure with flexible xrefID parameter (vs old pageID)
  - Added: level_name column with :- indentation pattern for clean display
  - Maintained: Both comp_name (clean) and level_name (formatted) for flexibility
  - Result: Database handles formatting logic instead of complex bash/jq

  3. Built Comprehensive Workflow Infrastructure

  A. Reference Data System (select_vals table)

  -- Event types: onLoad, onChange, onRefresh
  -- Action types: setVals, getVal, clearVals, execEvent
  -- Categories: component, container, page, stub

  B. Clean Trigger Management (eventTrigger table)

  Before (JSON nightmare):
  "workflowTriggers": {"onChange": [{"action": "setVals([{\"paramName\": \"appID\", \"paramVal\": \"{{this.value}}\"}])"}]}

  After (clean table):
  xref_id=35, class='onChange', action='setVals', content='appID,{{this.value}}'

  4. Standardized Component Triggers

  - selectApp (35): onLoad → execEvent(34), onChange → setVals(appID)
  - selectPage (36): onRefresh → execEvent(38,{appID}), onChange → setVals(pageID) + refresh + clearVals
  - btnGenPageConfig (37): onClick → execEvent(39,{pageID})
  - AppSelector (44): onChange → setVals(appID + selectedApp) + navigate

  5. Created Generic EventType Queries

  - EventType 39: pageConfigHier - calls sp_hier_structure(:xrefID)
  - EventType 52: hierReturn - legacy hierarchy query
  - EventType 53: getTriggers - queries workflow triggers by xrefID

  🏗️ Architecture Improvements

  Context Store Workflow

  1. User interactions set values: setVals([{"paramName": "appID", "paramVal": "value"}])
  2. Components reference context: WHERE parent_id = :appID
  3. Clean parameter substitution throughout the system

  Table Structure Rationalization

  Before: Massive eventType_xref table with mixed concerns
  -- props, tmplt_def, base_styles, override_styles, workflowTriggers, etc.

  After: Focused separation
  eventType_xref: Core hierarchy/relationships only
  eventTrigger: Clean workflow management
  select_vals: Reference data and validation

  🔄 Next Steps (Post-Golf!)

  1. Complete Trigger Migration

  - Extract remaining workflowTriggers from JSON to eventTrigger table
  - Update genPageConfig to query eventTrigger instead of JSON props
  - Clean up eventType_xref table by removing workflowTriggers column

  2. Implement Action Handlers

  - Build action dispatcher that processes eventTrigger rows
  - Implement missing actions: navigate, refresh, studioApiCall
  - Create action validation against select_vals reference data

  3. genPageConfig Integration

  // Query triggers and build workflowTriggers object
  const triggers = await query(`SELECT class, action, ordr, content
                               FROM eventTrigger
                               WHERE xref_id = ? ORDER BY class, ordr`);

  4. UI Development

  - Build grid-based trigger editor (much easier than JSON!)
  - Create reusable trigger patterns
  - Implement trigger testing/validation tools

  5. Consider Further Table Rationalization

  - Extract props from eventType_xref to dedicated table
  - Extract tmplt_def and styles to separate tables
  - Create clean views that reassemble data when needed
  - Consider eventQueries and eventProps tables

  🎉 Key Wins

  1. No more JSON escaping hell - Workflow triggers are now clean, queryable table rows
  2. Standardized event/action patterns - Easy to spot inconsistencies and fix them
  3. Database-driven formatting - Less complex client-side formatting logic
  4. Reusable queries - EventType 53 can be used anywhere for trigger lookup
  5. Clean separation of concerns - Each table has a focused responsibility

  🏌️ Have a Great Golf Trip!

  The foundation is solid - when you return, the implementation should be straightforward since the hard architectural decisions are made and the data model is clean. The /wf-hierarchy
   command working perfectly proves the approach is sound!

  Next chat should focus on: Action handler implementation and completing the trigger migration from JSON to tables.