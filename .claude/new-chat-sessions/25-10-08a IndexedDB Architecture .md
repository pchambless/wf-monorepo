Studio IndexedDB Architecture - Normalized Draft System

  Date: 2025-10-08Session Focus: Implementing normalized IndexedDB architecture for component/trigger/prop editing

  ---
  🎉 Major Accomplishments

  1. Normalized IndexedDB Schema ✅

  Replaced nested pageDrafts structure with normalized tables:

  // Draft tables (user editing)
  componentDrafts: xref_id, comp_name, parent_id, comp_type, _dmlMethod
  triggerDrafts: xref_id, trigger_id, class, action, _dmlMethod
  propDrafts: xref_id, paramName, paramVal, _dmlMethod
  eventTypeDrafts: eventType_id, name, category, _dmlMethod (future)
  eventSQLDrafts: eventSQL_id, qryName, _dmlMethod (future)

  // Reference tables (dropdowns/lookups)
  triggerReference: id, trigType, name (21 records)
  eventSQLReference: id, qryName (17 records)
  eventTypeReference: id, name, category (19 records)

  Key Design:
  - Each entity (component/trigger/prop) stored separately
  - _dmlMethod tracks INSERT/UPDATE/DELETE per record
  - Assembled on-demand for preview/render
  - MySQL remains source of truth

  2. Modular Architecture ✅

  Created separate, focused modules:

  - referenceLoaders.js - Load trigger/eventSQL/eventType lookups once on startup
  - pageLoader.js - Load page components/props/triggers into normalized tables
  - componentConfigBuilder.js - Assemble component configs from normalized data
  - componentSaver.js - Save component structure changes
  - propSaver.js - Save props as JSON to eventComp_xref
  - triggerSaver.js - Individual INSERT/UPDATE/DELETE for triggers
  - studioSaveWorkflow.js - Orchestrates all save operations

  Benefits:
  - Each file < 150 lines
  - Easy to test/modify independently
  - Clear separation of concerns
  - Stays under 4k token limit

  3. _dmlMethod Tracking System ✅

  Pattern:
  // Load from MySQL → all marked null
  { xref_id: 56, class: "onClick", _dmlMethod: null }

  // User adds trigger → marked INSERT
  { xref_id: 56, class: "onSubmit", _dmlMethod: "INSERT" }

  // User edits trigger → marked UPDATE
  { trigger_id: 123, class: "onClick", _dmlMethod: "UPDATE" }

  // User deletes trigger → marked DELETE (kept until save)
  { trigger_id: 124, _dmlMethod: "DELETE" }

  // Save → only process records with _dmlMethod !== null
  // After save → clear _dmlMethod markers

  Enables:
  - Surgical saves (only changed items)
  - Add/edit/delete triggers independently
  - Track pending operations
  - Undo by clearing _dmlMethod

  4. Reference Data Loading ✅

  Created eventSQL queries:
  - triggerList - Get all trigger types for dropdowns
  - qrySqlList - Get all queries for reference
  - eventTypeList - Get all component types

  Loaded once on Studio startup:
  📚 Loading reference data...
  ✅ Loaded 21 trigger references
  ✅ Loaded 17 eventSQL references
  ✅ Loaded 19 eventType references

  5. Audit Column Filtering ✅

  Auto-exclude server-managed columns:
  const AUDIT_COLUMNS = [
    'created_at', 'created_by',
    'updated_at', 'updated_by',
    'deleted_at', 'deleted_by',
    'active'
  ];

  These are stripped when loading into IndexedDB and handled by server on INSERT/UPDATE.

  6. Field Name Standardization ✅

  Normalized field_name → name:
  // MySQL returns field_name
  { field_name: "id", DATA_TYPE: "int" }

  // Normalized to name in IndexedDB
  { name: "id", DATA_TYPE: "int" }

  All code now uses column.name consistently for Grids and Forms.

  7. Schema Cleanup ✅

  Version 5 removes legacy tables:
  - Deleted: canvasSnapshots, pendingXrefs, componentCache, layoutDrafts, queryCache, reactFlowState, pageDrafts
  - Kept: Only 8 active normalized tables

  DB Browser now shows clean, focused schema.

  ---
  📋 Current State

  Working ✅

  - Reference tables load on startup
  - Page loads into normalized componentDrafts/propDrafts/triggerDrafts
  - All records marked with _dmlMethod: null
  - DB Browser shows populated tables
  - IndexedDB v5 schema active

  Not Yet Implemented ⏳

  - Editing props to mark _dmlMethod: "UPDATE"
  - Editing triggers to mark _dmlMethod: "UPDATE"
  - Adding new triggers with _dmlMethod: "INSERT"
  - Save workflow (componentSaver/propSaver/triggerSaver)
  - ComponentPropertiesPanel integration with normalized data
  - React Flow canvas (connections broken, needs hierarchy rendering fix)

  Known Issues 🐛

  - parent_id showing as undefined in componentDrafts (should be parent_name)
  - React Flow not rendering component hierarchy
  - React Flow not showing connections between components

  ---
  🚀 Next Steps (Priority Order)

  Immediate (Next Session)

  1. Fix parent_id Issue
    - parent_id column in componentDrafts gets undefined
    - Should use parent_name from eventComp_xref
    - Update pageLoader.js to map correctly
  2. Wire ComponentPropertiesPanel to Normalized Data
    - Update to read from propDrafts/triggerDrafts
    - Mark _dmlMethod: "UPDATE" when edited
    - Use updateComponentProp helper from new workflow
  3. Test Save Workflow End-to-End
    - Edit a prop → check _dmlMethod marked
    - Click "Save to MySQL" → verify DML executes
    - Check MySQL for updated data
    - Verify _dmlMethod cleared after save
  4. Add Trigger Editing UI
    - List triggers from triggerDrafts
    - Add trigger → mark _dmlMethod: "INSERT"
    - Edit trigger → mark _dmlMethod: "UPDATE"
    - Delete trigger → mark _dmlMethod: "DELETE"
    - Use triggerReference for class/action dropdowns

  Medium Priority

  5. Fix React Flow Canvas
    - Restore component hierarchy rendering
    - Fix parent-child connections
    - Render nested components visually
    - Use componentDrafts to build flow nodes
  6. EventType/EventSQL Editors
    - Create modal/page to edit eventType definitions
    - Create modal/page to edit eventSQL queries
    - Use eventTypeDrafts/eventSQLDrafts with _dmlMethod tracking
    - Save back to api_wf.eventType and api_wf.eventSQL
  7. Preview from IndexedDB
    - Use buildPageConfig() to assemble from drafts
    - Render with DirectRenderer
    - Show live preview as user edits
    - No server call needed for preview

  Future Enhancements

  8. Component Creation UI
    - Form to create new eventComp_xref entries
    - Select parent, type, container from dropdowns
    - Mark with _dmlMethod: "INSERT"
    - Save creates new component in MySQL
  9. Undo/Redo System
    - Use reactFlowState to track canvas snapshots
    - Store before/after states
    - Restore by reverting _dmlMethod changes
  10. Conflict Detection
    - Check if MySQL data changed since load
    - Warn user before overwriting
    - Merge strategy or force user choice

  ---
  💡 Architectural Insights

  Normalized vs Nested Trade-offs

  Chose normalized because:
  - ✅ True independent trigger/prop management
  - ✅ Scalable for complex queries
  - ✅ Maps cleanly to MySQL schema
  - ✅ Easy to add new entity types
  - ✅ Modular save logic

  Trade-off accepted:
  - More IndexedDB queries to assemble component
  - Solved with buildComponentConfig() helper

  _dmlMethod Pattern

  Simple and effective:
  - Single field tracks operation type
  - null = no change, skip on save
  - "INSERT" = new record
  - "UPDATE" = modified existing
  - "DELETE" = mark for removal (kept until save)

  Alternative considered: Separate "changes" table
  - More complex
  - Harder to query
  - Rejected in favor of inline tracking

  Reference Tables Strategy

  Load once, use many:
  - Triggers, eventSQL, eventType rarely change
  - Load on startup, cache in IndexedDB
  - Dropdowns/pickers use cached data
  - Refresh manually or on schema change

  Could add: TTL refresh or version checking

  Modular File Structure

  Each workflow gets own file:
  - Easier to maintain
  - Stays under token limits
  - Clear responsibility
  - Easy to test

  Pattern to follow for future features

  ---
  📊 Session Stats

  - Files Created: 7 (referenceLoaders, pageLoader, componentConfigBuilder, componentSaver, propSaver, triggerSaver, studioSaveWorkflow)
  - Files Modified: 4 (studioDb, StudioSidebar, PageDraftControls, syncWorkflow)
  - Schema Version: v5 (cleaned up legacy tables)
  - Active IndexedDB Tables: 8 (down from 15)
  - Token Usage: ~144K/200K (72%)

  ---
  🎯 Success Criteria for Next Session

  1. ✅ parent_id field populated correctly
  2. ✅ Edit prop → _dmlMethod marked "UPDATE"
  3. ✅ Save to MySQL → DML executes → data updated
  4. ✅ _dmlMethod cleared after successful save
  5. ✅ Add/edit/delete triggers works end-to-end
  6. ✅ React Flow canvas renders component hierarchy
  7. ⏳ Preview renders from buildPageConfig()

  ---
  🔑 Key Decisions Made

  1. Normalized over nested - Better scalability, clearer intent
  2. _dmlMethod inline - Simpler than separate changes table
  3. Modular files - Keep each under 150 lines
  4. Reference tables cached - Load once on startup
  5. Audit columns excluded - Server manages, not client
  6. Field name standardized - Always use name, not field_name
  7. MySQL is source of truth - IndexedDB is working copy
  8. Modify all stored Props to also use name instead of field_name.

  ---
  Session End: 2025-10-08 17:30 (approx)