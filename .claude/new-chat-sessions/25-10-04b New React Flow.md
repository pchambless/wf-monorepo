 # React Flow Studio - Visual Page Builder (Session 2)

  **Date:** 2025-10-04
  **Context:** Building React Flow canvas, fixing data flow issues, discovering better architecture

  ---

  ## 🎉 Major Accomplishments

  ### 1. **React Flow Integration Complete** ✅
  - Installed `reactflow@11.11.0` in studio package
  - Created custom node components (Grid, Form, Container, Page, DefaultNode)
  - Built `pageConfigToFlow` transformer (database components → React Flow nodes)
  - Integrated PageFlowCanvas with pan/zoom/mini-map/controls

  ### 2. **Studio UI Layout Working** ✅
  ┌─────────┬──────────────────────────────┬───────────┐
  │ Sidebar │     React Flow Canvas        │Properties │
  │ (280px) │         (Fluid)               │  (360px)  │
  │         │                               │           │
  │ App: ▼  │   📦 Container                │ Component │
  │ Page: ▼ │    ├─ 📊 Grid                │ Props     │
  │         │    └─ 📝 Form                 │ Triggers  │
  │ Palette │                               │           │
  └─────────┴──────────────────────────────┴───────────┘

  - **StudioLayout** - 3-column responsive layout
  - **StudioSidebar** - App/Page dropdowns using eventSQL
  - **PageFlowCanvas** - Visual node editor
  - **ComponentPropertiesPanel** - Tabbed editor (Component/Props/Triggers)

  ### 3. **Data Flow Fixes**
  - Fixed dropdown using `xref_id` instead of `id` ✅
  - Added `xref_id` to genPageConfig output ✅
  - Fixed `pageConfigToFlow` to use `components` not `children` ✅
  - Created DefaultNode for unknown component types ✅
  - Skip auto-generated form fields (no xref_id) ✅

  ### 4. **Key Bug Fixes**
  - **Collation errors** - Switched from `parent_name` to `parent_id` in queries
  - **Duplicate keys** - Filter out components without xref_id
  - **Import paths** - Fixed DirectRenderer import
  - **Custom components** - Added StudioCanvasWrapper support to DirectRenderer
  - **Node types** - Added Button, Select, Default node types

  ---

  ## 💡 CRITICAL ARCHITECTURAL DISCOVERY

  ### The Problem with Current Flow:
  Database → genPageConfig → pageConfig.json (cached) → Studio
                                      ↓
                                ALWAYS OUT OF SYNC! ❌

  **Issues discovered:**
  1. `enhancedProps` parsing bug causes empty props in pageConfig
  2. Server restart required for code changes to take effect
  3. Cached pageConfig.json shows stale data
  4. Editing props in Studio requires saving → regenerating → reloading

  ### The BETTER Approach (Proposed):
  Database ← Studio reads/writes DIRECTLY → React Flow
                ↓ (when done editing)
           genPageConfig → pageConfig.json (for runtime only)

  **Benefits:**
  - ✅ **Always current** - Studio reads live database
  - ✅ **Simpler flow** - One source of truth
  - ✅ **Faster iteration** - No regeneration needed during editing
  - ✅ **pageConfig = deployment artifact** - Generated when ready to deploy

  **New Studio Flow:**
  1. Select page → fetch `sp_hier_structure(pageID)` directly
  2. React Flow displays database hierarchy
  3. Click node → load from eventType_xref
  4. Edit props → UPDATE database immediately
  5. Click "Generate" → create pageConfig for runtime

  ---

  ## 🐛 Outstanding Issues

  ### 1. **enhancedProps Not Parsing** ❌
  **Problem:** Server doesn't parse enhancedProps JSON string
  **Location:** `/apps/server/server/utils/pageConfig/index.js:153-158`
  **Fix Applied:** Parse enhancedProps if it's a string
  **Status:** Code changed but props still empty (server may not have reloaded?)

  **Code Fix:**
  ```javascript
  // OLD (broken):
  let props = item.enhancedProps || JSON.parse(item.props || '{}');

  // NEW (should work):
  let props = {};
  if (item.enhancedProps) {
    props = typeof item.enhancedProps === 'string'
      ? JSON.parse(item.enhancedProps)
      : item.enhancedProps;
  }

  Expected Result:
  - Grid props should show: {rowKey, selectable, columns: [...]}
  - Form props should show: {fields: [...]}

  Current Result: Props are incomplete {rowKey, selectable} - columns missing

  2. Form/Grid Props Empty in Properties Panel

  Symptoms:
  - Grid shows {rowKey: "id", selectable: true} but NO columns
  - Form shows {} but should show fields array
  - Database HAS the data in enhancedProps

  Root Cause: Either:
  - A) Server not parsing enhancedProps (despite fix)
  - B) Server hasn't restarted with new code
  - C) Different issue in the parsing logic

  ---
  📋 Next Steps (Recommended Order)

  Immediate - Fix Props Issue

  1. Debug enhancedProps parsing:
    - Add logging to genPageConfig to see what props object contains
    - Verify server restart actually loaded new code
    - Check if enhancedProps is being passed correctly
  2. OR pivot to database-first approach:
    - Skip genPageConfig for Studio editing
    - Fetch directly from sp_hier_structure
    - Show raw database data in properties panel

  Short Term - Database-First Studio

  3. Refactor StudioSidebar:
  // Instead of:
  const response = await fetch('/api/genPageConfig', {pageID});

  // Do:
  const response = await fetch('/api/execEventType', {
    eventSQLId: <sp_hier_structure>,
    params: {xrefID: pageID}
  });
  4. Update pageConfigToFlow:
    - Accept raw database hierarchy
    - Transform directly to React Flow nodes
    - No intermediate pageConfig needed
  5. Wire up save:
  const handleSaveProps = async (xref_id, newProps) => {
    await fetch('/api/execDML', {
      method: 'UPDATE',
      table: 'api_wf.eventType_xref',
      primaryKey: xref_id,
      data: { enhancedProps: JSON.stringify(newProps) }
    });
  };

  Medium Term - Full CRUD

  6. Edit component properties - Save to database immediately
  7. Edit triggers - Add/remove workflow steps
  8. Drag to reorder - Update posOrder in database
  9. Add component - INSERT into eventType_xref
  10. Delete component - Soft delete (set deleted_at)

  Future - Deploy Workflow

  11. "Generate" button - Runs genPageConfig when ready to deploy
  12. Preview mode - Test page before generating
  13. Version control - Track changes to page structure

  ---
  🔑 Key Files Modified

  Studio Components (Created)

  - /apps/studio/src/components/StudioLayout.jsx - Main 3-column layout
  - /apps/studio/src/components/StudioSidebar.jsx - App/Page selectors, palette
  - /apps/studio/src/components/PageFlowCanvas.jsx - React Flow integration
  - /apps/studio/src/components/ComponentPropertiesPanel.jsx - Properties editor
  - /apps/studio/src/components/FlowNodes/GridNode.jsx - Blue grid icon
  - /apps/studio/src/components/FlowNodes/FormNode.jsx - Green form icon
  - /apps/studio/src/components/FlowNodes/ContainerNode.jsx - Orange container icon
  - /apps/studio/src/components/FlowNodes/PageNode.jsx - Purple page icon
  - /apps/studio/src/components/FlowNodes/DefaultNode.jsx - Gray generic icon
  - /apps/studio/src/utils/pageConfigToFlow.js - Transformer utility

  Studio Pages (Modified)

  - /apps/studio/src/pages/Studio/index.jsx - Simplified to use StudioLayout
  - /apps/studio/src/pages/Studio/pageConfig.json - (deprecated for Studio UI)

  Server (Modified)

  - /apps/server/server/utils/pageConfig/index.js:182 - Added xref_id to output
  - /apps/server/server/utils/pageConfig/index.js:153-158 - Fixed enhancedProps parsing (NOT WORKING YET)

  Rendering (Modified)

  - /apps/studio/src/rendering/DirectRenderer.jsx - Added custom component support
  - /apps/studio/src/rendering/WorkflowEngine/TriggerEngine.js:21-23 - Added getContext() method

  ---
  📊 Database Structure

  eventSQL Queries Used

  -- id: 1 (appList)
  SELECT xref_id, comp_name
  FROM api_wf.vw_hier_components
  WHERE parent_id = 1 AND comp_type = 'App'

  -- id: 2 (pageList)
  SELECT xref_id, comp_name
  FROM api_wf.vw_hier_components
  WHERE parent_id = :appID AND comp_type = 'Page'

  -- sp_hier_structure (for page hierarchy)
  CALL api_wf.sp_hier_structure(:xrefID)

  Database Schema

  eventType_xref
  ├── xref_id (PK)
  ├── comp_name
  ├── comp_type
  ├── parent_id
  ├── enhancedProps (JSON string) ← Props stored here!
  ├── workflowTriggers (JSON string)
  └── override_styles (JSON string)

  ---
  💡 Key Lessons Learned

  1. IDs > Names for Lookups

  ✅ WHERE parent_id = 50         -- Fast, no collation issues
  ❌ WHERE parent_name = 'login'  -- Collation errors, slower

  2. Studio Should Edit Database Directly

  - Don't cache pageConfig for editing
  - Use pageConfig as deployment artifact only
  - Database is the source of truth

  3. Skip Auto-Generated Components in Diagrams

  - Form fields (label_id, input_name) have no xref_id
  - Filter these out of React Flow to show high-level structure only
  - Show details in properties panel, not as nodes

  4. Two Different "Templates"

  - EventType templates - How to render the actual component
  - Flow Node templates - How to visualize in Studio canvas
  - Don't confuse them!

  5. Server Restart Critical for Code Changes

  - Changes to /apps/server/ require restart
  - Watch for nodemon auto-restart
  - Verify changes took effect by checking behavior

  ---
  🚀 Resume Instructions

  To continue:

  1. Decide on approach:
    - A) Debug enhancedProps parsing (keep current architecture)
    - B) Pivot to database-first (recommended)
  2. If Option B (database-first):
  // StudioSidebar.jsx - loadPageConfig
  const response = await fetch('/api/execEventType', {
    method: 'POST',
    body: JSON.stringify({
      eventSQLId: <sp_hier_structure_id>,
      params: {xrefID: pageID}
    })
  });
  const hierarchyData = response.data;
  // Transform directly to React Flow nodes
  3. Test flow:
    - Select page → see React Flow diagram
    - Click node → see full props from database
    - Edit props → save to database
    - Regenerate pageConfig when ready to deploy
  4. Next features:
    - Editable properties panel
    - Save button → UPDATE database
    - Trigger editor
    - Component add/delete

  ---
  🎯 Current State

  What Works:
  - ✅ React Flow canvas renders
  - ✅ App/Page dropdowns populate
  - ✅ Nodes display (Container, Grid, Form)
  - ✅ Click node → properties panel activates
  - ✅ Visual diagram shows page structure

  What's Broken:
  - ❌ Props incomplete (missing columns, fields)
  - ❌ enhancedProps not parsing correctly
  - ❌ Can't edit properties yet
  - ❌ Can't save changes back to database

  Architecture Decision Needed:
  Should Studio:
  - A) Continue using genPageConfig (fix parsing bugs)
  - B) Read directly from database (cleaner, recommended)

  ---
  Token usage at save: ~140K/200KNext session: Fix props display OR pivot to database-first architecture

  Paul Question:  With new Database strategy, do we even need to build the triggers and props into the sp_hier_structure?
    it seems we would be able to fetch that stuff directly from the db... thoughts?