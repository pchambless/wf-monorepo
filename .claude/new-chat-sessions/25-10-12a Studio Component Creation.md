Studio Component Creation & Schema Refactoring - 2025-10-12

  Focus: Implemented component creation system with immediate MySQL commit, removed redundant pageID from IndexedDB schema, and began modularizing db/operations

  ---
  ✅ Major Accomplishments

  1. Component Creation System (Option 1 - Immediate Commit)

  - db/operations/componentOps.js - createComponent() now commits to MySQL immediately and returns both idbID and MySQL id
  - Solves parent-child dependency: Components get real MySQL ID instantly, usable as parent_id for children
  - No temp IDs needed: Simple workflow - create → get ID → use as parent

  2. Component Creation UI

  - ComponentPropertiesPanel.jsx - Added "New Component" mode
    - "+ New Component" button in empty state and header
    - Create mode shows: Type dropdown, comp_name, title, posOrder, description, parent dropdown
    - Parent dropdown now shows for ALL components (not just create mode)
    - Loads current parent_id when editing existing components
    - "✨ Create Component" button commits immediately

  3. IndexedDB Schema Simplification - Removed pageID

  - Problem identified: pageID was redundant - all components in IndexedDB are for current page (cleared on page switch)
  - Schema v2 (db/versions/v01.js) - Removed pageID index from eventComp_xref
  - Files updated to not query by pageID:
    - utils/pageLoader.js - clearPageData() now uses .toArray()
    - utils/componentConfigBuilder.js - buildPageConfig() gets all components
    - utils/componentSaver.js - No pageID filter
    - utils/studioSaveWorkflow.js - No pageID query
    - db/operations/componentOps.js - getComponentsByPage() returns all

  4. Database Organization

  - Reorganized db/ structure:
    - db/operations/ - Page building (eventComp_xref, eventProps, eventTriggers)
    - db/references/ - Reference tables (eventTypes, eventSQL, triggers)
    - Moved masterDataOps.js to references/

  5. Schema & API Fixes

  - Fixed table names: All DML calls now use api_wf.* schema prefix
  - Fixed execDml signature: Corrected to execDml(operation, { method, table, data })
  - Fixed reference loaders: Added error handling for React StrictMode duplicate key errors
  - Fixed initializeApp: Added mutex guard to prevent simultaneous initialization

  6. Parent Management

  - Parent dropdown always visible with current value
  - Editable in both create and update workflows
  - Saves to IndexedDB with _dmlMethod: 'UPDATE' for sync

  7. Modularization Started

  - Created folder structure for modular operations:
    - db/operations/eventComp_xref/ (insert.js created)
    - db/operations/eventProps/
    - db/operations/eventTriggers/
  - eventComp_xref/insert.js - Extracted with validation and logging

  ---
  📊 Statistics

  - Files created: 2 (insert.js, StudioSidebar Delete button)
  - Files modified: 15+
    - Schema: 2 (v01.js, studioDb.js)
    - Operations: 5 (componentOps, syncOps, masterDataOps, lifecycleOps, referenceLoaders)
    - Utils: 4 (pageLoader, componentConfigBuilder, componentSaver, studioSaveWorkflow)
    - Components: 2 (ComponentPropertiesPanel, StudioSidebar)
  - Schema version: Bumped from v1 → v2
  - IndexedDB tables: Removed 1 index (pageID)
  - Bugs fixed: 5
    - BulkError from StrictMode double-init
    - Schema errors from pageID queries
    - Missing parent_id in inserts
    - Table name missing schema prefix
    - execDml signature mismatch

  ---
  🚀 Next Steps

  Immediate (Next Hour)

  1. Complete modularization - Finish creating:
    - eventComp_xref/update.js, delete.js, read.js, index.js
    - eventProps/insert.js, update.js, delete.js, read.js, index.js
    - eventTriggers/insert.js, update.js, delete.js, read.js, index.js
  2. Update operations/index.js - Re-export from new modular structure
  3. Test component creation end-to-end - Verify parent_id persists correctly

  Short Term (Next Session)

  4. GitHub Issue: Template Cloning System - For baseCRUDPage instantiation
  5. Delete workflow refinements - Handle cascades (prevent if children, orphan children, or cascade delete)
  6. Update workflow enhancements - Circular reference detection for parent changes
  7. Modularize references/ - Apply same pattern to masterDataOps

  Future

  8. Component Palette - Drag-drop from eventTypes to canvas
  9. Template Browser - UI to browse and instantiate templates like baseCRUDPage
  10. Batch operations - Create multiple components from template hierarchy

  ---
  💡 Key Learnings

  Option 1 vs Option 2: Immediate Commit Wins

  - Decision: Create component → INSERT to MySQL immediately → get real ID
  - Why: Simpler than temp IDs, no resolution needed, works with existing MySQL patterns
  - Trade-off: No "draft mode" for creation (but draft mode still works for edits)

  IndexedDB pageID Was Redundant

  - Principle: Don't store what can be derived from workflow
  - Pattern: clearWorkingData() ensures only one page loaded at a time
  - Lesson: IndexedDB filtering by pageID was unnecessary complexity

  React StrictMode Double-Initialization

  - Problem: StrictMode calls useEffect twice simultaneously
  - Solution: Mutex-style guard with promise caching
  - Pattern:
  let initPromise = null;
  if (initPromise) return initPromise;
  initPromise = (async () => { /* work */ })();
  return initPromise;

  Modularization for Complexity

  - Pattern: When operations get complex (>50 lines with multiple responsibilities), split into:
    - insert.js - Creation with validation
    - update.js - Updates with business logic (parent changes, circular refs)
    - delete.js - Deletion with cascade handling
    - read.js - Query operations
  - Benefit: Easier to find, test, and enhance specific operations

  Schema Prefix Required

  - MySQL pattern: Always use api_wf.tableName not just tableName
  - Reason: Database may have multiple schemas

  ---
  📝 Code Snippets

  Component Creation Pattern

  // db/operations/eventComp_xref/insert.js
  export const insertComponent = async (componentData) => {
    // Insert to MySQL first to get real ID
    const response = await execDml('INSERT', {
      method: 'INSERT',
      table: 'api_wf.eventComp_xref',
      data: componentData
    });

    // Add to IndexedDB with MySQL ID
    const idbID = await db.eventComp_xref.add({
      ...componentData,
      id: response.insertId,
      _dmlMethod: null  // Already synced
    });

    return { idbID, id: response.insertId };
  };

  Parent Dropdown Pattern

  <select value={editedParentId} onChange={handleParentIdChange}>
    <option value="">None (top-level)</option>
    {availableParents.map(parent => (
      <option key={parent.id} value={parent.id}>
        {parent.comp_name || parent.title} ({parent.comp_type})
      </option>
    ))}
  </select>

  Mutex Guard for React StrictMode

  let initializePromise = null;

  export const initializeApp = async () => {
    if (initializePromise) {
      console.log('⏳ Initialization already in progress, waiting...');
      return initializePromise;
    }

    initializePromise = (async () => {
      try {
        // Do work
      } finally {
        setTimeout(() => { initializePromise = null; }, 100);
      }
    })();

    return initializePromise;
  };

  ---
  🔍 Template System Discovery

  baseCRUDPage template (id: 64 in admin app):
  - Complete hierarchy: Container → AddButton + Grid + Form → SubmitButton
  - Uses placeholders: {pageName}, {tableName}
  - GitHub Issue created for template cloning system

  ---
  Status: Component creation working with parent_id. Modularization structure created, ready to complete refactoring. Delete IndexedDB button added for schema updates.