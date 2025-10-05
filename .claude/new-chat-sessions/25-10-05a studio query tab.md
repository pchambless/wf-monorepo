# React Flow Studio - Database-First Architecture (Session 3)

  **Date:** 2025-10-05
  **Context:** Completed database-first visual page editor with property panels

  ---

  ## 🎉 Major Accomplishments

  ### 1. **Simplified Database Architecture** ✅
  - Refactored `sp_hier_structure` to return structure-only (no props/triggers)
  - Removed expensive JSON aggregation subqueries (~60 lines eliminated)
  - Returns: id, comp_name, title, comp_type, container, parent_id, posOrder, level, id_path
  - **Performance**: Dramatically faster hierarchy queries

  ### 2. **On-Demand Data Fetching** ✅
  - Fixed `execEventType` to prioritize passed params over context_store
  - Click node → fetch props/triggers only when needed
  - Uses existing queries: `xrefPropList` (id:7), `xrefTriggerList` (id:6)
  - Smart JSON formatter (`formatProps.js`) auto-parses nested JSON strings

  ### 3. **React Flow Visual Editor** ✅
  - Added missing node type: `app: PageNode`
  - Added target handles to all nodes (fixed edge errors)
  - Removed MiniMap (cleaner UI)
  - Canvas auto-shrinks with zoom controls (+/-)

  ### 4. **3-Section Column/Field Editor** ✅
  Created new components:
  - **ColumnSelector** - Pill-style buttons for column selection
  - **SchemaViewer** - Read-only DB schema display
  - **OverrideEditor** - Editable overrides (label, width, hidden, required, etc.)

  **Layout:**
  ┌─────────────────────────────────────┐
  │ Select Column                       │
  │ ○ id    ○ name    ○ description     │
  ├─────────────────────────────────────┤
  │ 🔒 Database Schema (read-only)      │
  │ Field Name:  id                     │
  │ Type:        INTEGER                │
  ├─────────────────────────────────────┤
  │ ✏️ Overrides (editable)             │
  │ Label:  [ID__________]              │
  │ Width:  [80px________]              │
  │ ☑ Hidden  ☐ Sortable                │
  └─────────────────────────────────────┘

  ### 5. **Query Tab** ✅ (NEW 4th Tab)
  - Auto-detects query from `onRefresh` trigger via `vw_eventSQL`
  - Shows query name, SQL, and table name
  - Green status banner when query configured
  - Collapsible Help button
  - Works for both Grid and Form components
  - Properties panel widened: 360px → 480px

  ### 6. **UI/UX Improvements** ✅
  - Bigger component type badge in header (16px, blue)
  - Taller SQL textarea (10 rows)
  - Removed redundant sections
  - "How it works" moved to Help button
  - Clean, spacious layout

  ### 7. **Key Bug Fixes** ✅
  - Fixed import path: `wf-login` → `login` (after app renames)
  - Fixed `vw_eventSQL` query (needed `api_wf.` prefix)
  - Created placeholder LoginPage for Studio
  - Removed old ColumnList/ColumnEditor (replaced with new 3-section layout)

  ---

  ## 📊 Database Schema Used

  ### EventSQL Queries Created:
  ```sql
  -- Get query associated with component
  id: 13, qryName: 'getEventSQL'
  SELECT xref_id, comp_name, comp_type, qryName, qrySQL
  FROM api_wf.vw_eventSQL
  WHERE xref_id = :xrefID

  -- Already existed:
  id: 6, qryName: 'xrefTriggerList'
  id: 7, qryName: 'xrefPropList'
  id: 8, qryName: 'qryList' (list of all queries for dropdown)

  Key Views:

  - vw_eventSQL - Joins components → triggers → eventSQL queries
  - vw_hier_components - Component hierarchy
  - sp_hier_structure - Simplified stored procedure

  ---
  🔑 Key Files Created/Modified

  New Components:

  - /apps/studio/src/components/PropertyEditors/ColumnSelector.jsx
  - /apps/studio/src/components/PropertyEditors/SchemaViewer.jsx
  - /apps/studio/src/components/PropertyEditors/OverrideEditor.jsx
  - /apps/studio/src/components/PropertyEditors/QuerySetup.jsx
  - /apps/studio/src/utils/formatProps.js (reusable utility)

  Modified:

  - /apps/studio/src/components/ComponentPropertiesPanel.jsx - Added Query tab, integrated editors
  - /apps/studio/src/components/StudioLayout.jsx - Widened properties panel
  - /apps/studio/src/components/PageFlowCanvas.jsx - Fixed node types, on-demand fetching
  - /apps/studio/src/components/StudioSidebar.jsx - Database-first hierarchy loading
  - /apps/server/server/controller/execEventType.js - Fixed param resolution (passed params first)
  - /apps/studio/src/sql/database/api_wf/procedures/sp_hier_structure.sql - Simplified

  Deleted:

  - Old ColumnList.jsx and ColumnEditor.jsx (replaced)

  ---
  💡 Architecture Decisions

  Standard Field/Column Structure:

  // AGREED STANDARD for both Grid and Form:
  {
    "name": "id",           // ← Standardized (not "field")
    "label": "ID",          // ← Display text
    "type": "number",
    "required": true,

    // Grid-specific overrides:
    "width": "80px",
    "sortable": true,

    // Form-specific overrides:
    "row": 1,
    "col": 1,
    "group": "Basic Info"
  }

  Data Flow:

  1. Select page → sp_hier_structure (structure only, fast)
  2. React Flow renders nodes
  3. Click node → setVals(xrefID) + fetch props/triggers (on-demand)
  4. Display in 3-section editor
  5. (Future) Edit → save to database
  6. (Future) Generate pageConfig when ready to deploy

  ---
  📋 Next Steps (Priority Order)

  Immediate - Query Management UI

  1. Convert Query Name to Dropdown
  // Fetch available queries
  const queries = await execEvent('qryList', {});

  // Render dropdown
  <select value={queryName}>
    {queries.map(q => (
      <option value={q.qryName}>{q.qryName}</option>
    ))}
  </select>
  <button>+ New</button>
  2. Add Description Field
  <label>Description</label>
  <textarea
    value={queryDescription}
    onChange={handleDescriptionChange}
    rows={3}
  />
    - Helps developers choose correct query
    - Editable (UPDATE eventSQL.description)
  3. Create Query Modal (Create/Edit)
  <QueryModal mode={isNew ? 'create' : 'edit'}>
    <input name="qryName" />
    <textarea name="description" />
    <textarea name="qrySQL" />
    <button>Save</button>
  </QueryModal>
    - Single modal, two modes
    - Create → INSERT into eventSQL
    - Edit → UPDATE eventSQL

  Short Term - Field Generation

  4. Implement Field Generation
    - Wire up sp_ai_generate_fields stored procedure
    - Call with tableName + componentType
    - Store result in eventProps.columns or eventProps.fields
    - Refresh column selector
  5. Test Field Generation Workflow
    - Select table → Generate → Verify columns appear
    - Test Grid vs Form differences
    - Validate field types match SQL schema

  Medium Term - Save Functionality

  6. Enable Override Saving
    - Implement save handler in StudioLayout
    - UPDATE eventProps.columnOverrides
    - Show success feedback
    - Refresh UI
  7. Trigger Editor
    - Visual workflow builder (not raw JSON)
    - Add/remove/reorder trigger actions
    - Save to eventTrigger table

  Future - Full CRUD

  8. Component Manipulation
    - Drag nodes to reorder (update posOrder)
    - Add new components (INSERT eventType_xref)
    - Delete components (soft delete)
    - Duplicate components
  9. Deploy Workflow
    - "Generate PageConfig" button
    - Creates runtime pageConfig.json
    - Version control integration
    - Preview mode before generating

  ---
  🐛 Known Issues

  1. Field generation not implemented - Placeholder throws error
  2. Save button hidden - Editing disabled until orchestration ready
  3. Query dropdown - Currently uses datalist (should be proper dropdown)
  4. No query descriptions shown - Need to add description field to Query tab

  ---
  🎯 Current State

  What Works:

  - ✅ Visual page hierarchy in React Flow
  - ✅ Click node → see props/triggers
  - ✅ 3-section column/field editor (read-only)
  - ✅ Query auto-detection and display
  - ✅ Smart JSON formatting
  - ✅ Component type-specific UI (Grid vs Form)

  What's Next:

  - 🔲 Query dropdown + modal
  - 🔲 Field generation from schema
  - 🔲 Save override functionality
  - 🔲 Trigger editor

  ---
  💬 Key Insights

  1. Database-first is cleaner - No stale pageConfig.json during editing
  2. On-demand is faster - Only fetch what you need, when you need it
  3. Standardization matters - Common structure (name/label/type) across Grid/Form
  4. Meta-queries everywhere - Use eventSQL to query eventSQL itself
  5. Read-only first, edit later - Get viewing right before enabling editing

  Paul Questions
  1.  I don't know if this is possible, but in react flow can the page be a big area with the components nested inside of it?  Likewise for the other containers?
      so the CRUD Container would have the Grid and the Form inside of it, with the CRUD container inside of the page?  Just a thought... 

  ---
  Token usage at save: ~143K/200K (93% used)
  Next session: Query management UI + field generation implementation
  ```