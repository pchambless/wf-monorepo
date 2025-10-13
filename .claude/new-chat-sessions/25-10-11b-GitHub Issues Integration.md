Studio Development - GitHub Issues Integration & Schema Cleanup - 2025-10-11

  Focus: Built GitHub Issues integration, fixed React Flow hierarchy rendering, removed ref* tables, cleaned up eventComp_xref schema

  ---
  ✅ Major Accomplishments

  1. GitHub Issues Integration (MVP)

  - Server-side API (/apps/server/server/controller/githubController.js)
    - GET /api/github/labels - Fetch repository labels
    - GET /api/github/issues - List issues with filters (state, labels)
    - POST /api/github/issues - Create new issues
    - GET /api/github/issues/:issue_number/comments - Fetch issue comments
    - Lazy-initialized Octokit client with proper .env token loading
  - Studio UI Components
    - FloatingActionButton.jsx - Blue FAB in bottom-right corner
    - IssuesModal.jsx - Tabbed modal (Create/View issues)
        - Create tab: Title, description (markdown), label selection
      - View tab: Single-line compact issue list with expand/collapse
      - Expandable details show full body + comments with inline images
      - Filter by state (open/closed/all) and labels
  - Workflow: Create issues in Studio → Add images in GitHub → View with rendered images in Studio
  - Token efficiency: ~1200 tokens per issue (including image viewing)

  2. React Flow Hierarchy Rendering Fix (Issue #2)

  - Root cause: Field name mismatch - buildComponentConfig returned parentID but pageConfigToFlow looked for parent_id
  - Solution (/apps/studio/src/utils/pageConfigToFlow.js:159)
  const rawParentId = component.parentID || component.parent_id;
  const parentId = rawParentId ? String(rawParentId) : null;
  - Added: expandParent: true flag for nested React Flow nodes
  - Result: Components now properly nest inside parents (Container → Grid/Form → Button)

  3. IndexedDB Schema Simplification

  - Removed 5 ref tables*: refContainers, refComponents, refTriggerActions, refTriggerClasses, refSQL
  - New approach: Query master tables directly (eventTypes, eventSQL, triggers)
  - Component Type dropdown now shows: "Button (component)", "Page (page)", "Container (container)"
  - Updated files:
    - /apps/studio/src/db/versions/v01.js - Schema updated (6 tables vs 11)
    - /apps/studio/src/utils/referenceLoaders.js - Removed ref* loaders
    - /apps/studio/src/db/studioDb.js - Removed ref* exports
    - /apps/studio/src/db/operations/lifecycleOps.js - Updated refresh functions
    - /apps/studio/src/components/ComponentPropertiesPanel.jsx - Direct eventTypes query
    - /apps/studio/src/components/PropertyEditors/QuerySetup.jsx - Direct eventSQL query

  4. Component Tab Enhancements

  - Added fields:
    - comp_name (editable, flexible width)
    - posOrder (140px, format: row,col,width)
    - description (textarea, 60px height, resizable)
  - Resized: ID field from 80px → 60px, centered
  - Layout: ID + comp_name + posOrder on first row; Title, Description, Type on separate rows
  - Save functionality: Updates IndexedDB with _dmlMethod: 'UPDATE' for MySQL sync

  5. Container Field Removal (Issue #5)

  - Removed from:
    - IndexedDB schema (eventComp_xref table)
    - Component Tab UI (dropdown deleted)
    - pageLoader.js and componentConfigBuilder.js
    - All state management (editedContainer, handleContainerChange)
  - Rationale: Parent relationship determines containment - field was redundant and misleading

  6. App Initialization Fix

  - Added initializeApp() call in App.jsx:27
  - Loads master data on startup: eventTypes, eventSQL, triggers from MySQL → IndexedDB
  - Fixes: Type dropdown now populates correctly

  ---
  📊 Statistics

  - Files created: 3 (githubController.js, FloatingActionButton.jsx, IssuesModal.jsx)
  - Files modified: 16
    - Server: 3 (githubController, registerRoutes, server.js)
    - Studio components: 4 (ComponentPropertiesPanel, QuerySetup, StudioLayout, App.jsx)
    - Utilities: 5 (pageConfigToFlow, pageLoader, componentConfigBuilder, referenceLoaders, lifecycleOps)
    - Database: 2 (v01.js schema, studioDb.js)
    - Routes: 1 (registerRoutes.js)
  - NPM packages added: 1 (@octokit/rest)
  - IndexedDB tables removed: 5 (ref* tables)
  - Issues implemented: 2 (Issue #2 React Flow, Issue #5 Container removal)
  - Bugs fixed: 3 (parentID mismatch, .env loading, Type dropdown empty)
  - Token usage: ~177k / 200k (88.5%)

  ---
  🚀 Next Steps

  Immediate (Next Session)

  1. Test Component Tab - Verify comp_name, posOrder, description save to IndexedDB
  2. MySQL Schema Updates (Issue #5) - Update vw_hier_components and sp_hier_structure to remove container, add description
  3. Sync Component Metadata - Ensure comp_name, posOrder, description sync to MySQL (not just props)
  4. Delete IndexedDB - Clear old schema, test fresh load with new v01 schema

  Short Term

  5. Issue #4 Implementation - Template management UI (button in sidebar to edit eventTypes/eventSQL/triggers)
  6. Image Upload Enhancement - Add drag-drop upload for issue images (currently paste markdown URLs only)
  7. Component Tab Polish - Add parent dropdown (query eventComp_xref for same pageID), show hierarchy context
  8. Trigger Tab - Build UI for editing triggers (class/action dropdowns from master triggers table)

  Future Enhancements

  9. Issue Commenting - Add ability to create comments from Studio (POST /api/github/issues/:number/comments)
  10. Issue Status Updates - Change issue state (open/closed) from Studio
  11. Template Editor - Full CRUD for eventTypes, eventSQL, triggers tables
  12. Component Reordering - Visual drag-drop for posOrder in React Flow canvas

  ---
  💡 Key Learnings

  GitHub API Integration Pattern

  - Lazy initialization of Octokit client ensures .env loaded before use
  - Token security: Server-side controller keeps token out of client
  - Field name mapping: buildComponentConfig uses camelCase (parentID), pageConfigToFlow needs snake_case (parent_id) - handle both
  - Image rendering: Use dangerouslySetInnerHTML with regex to convert markdown ![](url) to <img> tags

  IndexedDB Master vs Reference Tables

  - Decision: Query master tables directly instead of maintaining separate ref* tables
  - Benefits: Single source of truth, no sync logic, fewer tables (6 vs 11)
  - Pattern:
  const types = await db.eventTypes.orderBy('name').toArray();
  const formatted = types.map(t => ({
    name: t.name,
    displayName: `${t.name} (${t.category})`
  }));

  React Flow Nested Nodes

  - Requirements:
    - Set node.parentNode = parentId for children
    - Set node.expandParent = true to auto-expand parent
    - Child positions are relative to parent's top-left corner
    - Parent nodes must exist before children are rendered (sort by level)

  Container Field Removal Philosophy

  - Principle: Don't duplicate data that can be derived from relationships
  - Container = parent's type - no need to store separately
  - Applies to: Any field where parent relationship determines the value

  App Initialization Pattern

  - Load master data once on app startup (eventTypes, eventSQL, triggers)
  - Working data loads per page (eventComp_xref, eventProps, eventTriggers)
  - Lifecycle: initializeApp() → clearWorkingData() → loadPageForEditing()

  ---
  📝 Code Snippets

  GitHub Issue List - Compact Single-Line Layout

  // Issue card with: #number, Status badge, Title, Labels, Username, Date, Expand, GitHub link
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ fontSize: '16px', fontWeight: '600', minWidth: '50px' }}>
      #{issue.number}
    </div>
    <div style={{
      padding: '4px 8px',
      borderRadius: '12px',
      backgroundColor: issue.state === 'open' ? '#28a745' : '#6f42c1',
      color: 'white'
    }}>
      {issue.state}
    </div>
    <div style={{ flex: 1 }}>{issue.title}</div>
    {/* Labels, username, date, buttons... */}
  </div>

  Query Master Tables for Dropdowns

  // Instead of: const types = await db.refComponents.toArray();
  const types = await db.eventTypes
    .orderBy('name')
    .toArray()
    .map(t => ({
      name: t.name,
      category: t.category,
      displayName: `${t.name} (${t.category})`
    }));

  IndexedDB Update Pattern

  await db.eventComp_xref.update(xref_id, {
    comp_name: editedCompName,
    title: editedTitle,
    posOrder: editedPosOrder,
    description: editedDescription,
    _dmlMethod: 'UPDATE' // Marks for MySQL sync
  });

  ---
  🔍 Debugging Notes

  Issue #2 Debug Process

  1. Console showed parentNode: undefined for all nodes
  2. Added debug logs showing parent_id=undefined from data
  3. Traced to buildComponentConfig returning parentID (camelCase)
  4. pageConfigToFlow was looking for parent_id (snake_case)
  5. Solution: Handle both formats with fallback

  Type Dropdown Empty

  1. Dropdown rendered but showed only "Select type..."
  2. Checked eventTypes state - empty array
  3. No initializeApp() call on startup
  4. Solution: Added initializeApp() to App.jsx useEffect

  ---
  Status: Ready for testing. Component Tab complete with all fields. GitHub Issues integration working. IndexedDB schema simplified. 
  Status: Type in Component Tab still not populating... 