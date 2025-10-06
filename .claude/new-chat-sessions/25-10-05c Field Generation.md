Field Generation & Studio UI Improvements (Session 5)

  Date: 2025-10-05
  Context: Built complete field generation workflow, stored procedures, and improved Studio UI

  ---
  🎉 Major Accomplishments

  1. Field Generation System ✅

  Created sp_genFields stored procedure that:
  - Accepts only xref_id parameter
  - Looks up component from vw_eventSQL (gets qrySQL, comp_type)
  - Parses SELECT clause to extract column list
  - Parses FROM clause to extract schema + table name
  - Queries information_schema.columns for ONLY columns in SELECT
  - Returns 2 result sets:
    - Metadata: {xref_id, table_name, schema_name, component_type, selected_columns}
    - Fields: [{field_name, data_type, suggested_input_type, component_props}, ...]

  Smart Type Detection:
  - Foreign keys (*_id) → hidden
  - Audit fields → hidden
  - text/longtext → textarea
  - datetime/timestamp → datetime-local
  - int/bigint/decimal → number
  - tinyint → checkbox

  Component-Specific Props:
  - Grid: {sortable: true, filterable: true, width: 100-200}
  - Form: {required: true/false, placeholder: "Enter field name"}

  2. Studio Integration ✅

  Query Tab:
  - "Generate Fields from Schema" button
  - Calls execEvent('xrefFieldGen', {xref_id})
  - Prompts: "Generated 3 fields. Save to component?"
  - Saves to eventProps as JSON blob:
  INSERT INTO api_wf.eventProps (xref_id, propName, propType, propVal)
  VALUES (56, 'columns', 'json', '[{...},{...}]')
  ON DUPLICATE KEY UPDATE propVal=[...], updated_at=NOW()

  3. Compact Props UI ✅

  Before:
  🔒 Database Schema (read-only)
    Field Name: id
    Type: NUMBER

  ✏️ Overrides
    Label: [______]
    Width: [______]
    Hidden: [x]

  After (compact):
  ✏️ Overrides
  [Label: ___] [Width: __] [☑Hidden] [☐Required] [☐Sortable]
  [Save] [Reset]

  👁️ Preview (editable JSON)
  {
    "field_name": "id",
    "data_type": "int",
    "label": "Custom Label",
    "width": 120,
    "hidden": true
  }

  Changes:
  - Removed SchemaViewer component
  - Created PreviewPane component
  - Condensed OverrideEditor to single row
  - Preview shows merged schema + overrides
  - Preview is editable (power users can edit JSON directly)

  4. Component Cloning ✅

  Created sp_clone_component_tree stored procedure:
  - Accepts template_xref_id, new_parent_id, new_comp_name
  - Recursively clones entire tree (components, props, triggers)
  - Returns mapping of old IDs → new IDs
  - Preserves structure, updates parent references

  Template Created:
  baseCRUDPage (CRUD)
  └─ baseCRUDContainer (98% centered)
     ├─ baseAddButton (Row 1, 25% left)
     ├─ baseGrid (Row 2, 50% left)
     └─ baseForm (Row 2, 50% right)
        └─ baseSubmitButton (Row 3, 20% right)

  5. Bug Fixes ✅

  React Flow Rendering:
  - Fixed posOrder = "00,00,00" → treated as 0% width (invisible)
  - Added check: if widthNum === 0 return null (no positioning)
  - Added crud: PageNode to nodeTypes mapping

  Stored Procedure Issues:
  - Case sensitivity: FROM vs from → Fixed with LOWER()
  - Newline handling: \r\n breaking parsing → Fixed with REPLACE()
  - Schema detection: Hardcoded api_wf → Now extracts from FROM clause
  - Column filtering: All columns vs SELECT only → Fixed with FIND_IN_SET()

  ---
  🔑 Key Files Created/Modified

  Stored Procedures:
  - /apps/studio/src/sql/database/api_wf/procedures/sp_genFields.sql - Field generation
  - /apps/studio/src/sql/database/api_wf/procedures/sp_clone_component_tree.sql - Component cloning

  Studio Components:
  - /apps/studio/src/components/PropertyEditors/PreviewPane.jsx - NEW preview panel
  - /apps/studio/src/components/PropertyEditors/OverrideEditor.jsx - Compact layout
  - /apps/studio/src/components/ComponentPropertiesPanel.jsx - Field generation + save logic
  - /apps/studio/src/components/PropertyEditors/QuerySetup.jsx - Generate button workflow

  Backend:
  - /apps/server/server/controller/genFields.js - Dual-purpose (legacy + new)

  Database:
  - eventSQL.xrefFieldGen → CALL api_wf.sp_genFields(:xrefID)
  - eventSQL.cloneComponent → CALL api_wf.sp_clone_component_tree(...)

  ---
  📋 Current State

  What Works:
  - ✅ Generate fields from schema (only SELECT columns)
  - ✅ Smart type detection + component props
  - ✅ Save fields to eventProps as JSON
  - ✅ Compact Props UI with live preview
  - ✅ Preview is editable
  - ✅ Component cloning (full tree)
  - ✅ CRUD template with Add button

  What's Next:
  - Build UI for field editing/reordering
  - Test saving overrides and regenerating (preserve edits)
  - Implement clone UI in Studio
  - Create more templates (Tab layout, Modal form, etc.)

  ---
  💡 Architecture Decisions

  Why Single JSON Blob for Fields?
  - Easier for React to load/edit/save
  - Atomic updates (one row vs many)
  - Flexible structure
  - Matches modern app patterns

  Why Two Result Sets from SP?
  - Metadata separate from field data
  - No repetition of table_name, component_type on every row
  - Client knows which component (xref_id)
  - Cleaner data structure

  CRUD Rules:
  - No SELECT * (must be explicit)
  - No aliases for CRUD (direct column mapping)
  - Reports can have aliases (but don't need field generation)

  ---
  🐛 Known Issues

  None! Field generation working end-to-end.

  ---
  Token usage at save: ~148K/200K (74%)
  Next session: Field editing UI, override preservation on regenerate