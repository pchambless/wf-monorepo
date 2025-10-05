DirectRender CRUD Pattern - First Working Implementation

  Date: 2025-10-02Context: Building database-driven CRUD pages with DirectRenderer

  🎉 Accomplishments

  1. Migrated execEvent to sqlName (Clarity over IDs)

  - Modified: /apps/wf-server/server/controller/execEventType.js
  - Change: Accepts qryName (string) or ID (number), resolves either
  - Benefit: Self-documenting triggers - execEvent("ingrTypeList") vs execEvent("11")
  - Database: Updated all 7 execEvent triggers to use readable query names

  2. Simplified Component IDs (Scoped Hierarchy)

  - Modified: /apps/wf-server/server/utils/pageConfig/index.js
  - Change: Child IDs are scoped, not prefixed
    - Before: ingrTypeGrid_table_thead_headerRow
    - After: table → thead → headerRow
  - Benefit: Generic, reusable component trees

  3. First Working CRUD Page (Ingredient Types)

  - Components: Grid (left) + Form (right) side-by-side layout
  - Flow Implemented:
    - Page onLoad → clearVals + refresh grid
    - Grid onRefresh → execEvent("ingrTypeList") - loads data ✅
    - Grid onChange → setVals(ingrTypeID) + refresh form ✅
    - Form onRefresh → execEvent("ingrTypeDtl") - loads detail ✅
    - Form onSubmit → execDML (INSERT/UPDATE) 🚧
    - Form onSuccess → refresh grid ✅

  4. Page-Level Trigger Support

  - Modified: /apps/wf-server/server/utils/pageConfig/index.js
  - Change: Root config includes workflowTriggers from page component
  - Modified: /apps/wf-studio/src/rendering/DirectRenderer.jsx
  - Change: Executes page-level onLoad triggers on mount
  - Result: Page initialization flow works correctly

  5. CSS Grid Layout Positioning

  - Modified: DirectRenderer to support position props
  - Implementation: 12-column CSS grid with row/col positioning
  - Conversion: posOrder (01,04;01,06) → gridRow/gridColumn CSS
  - Result: Components position correctly side-by-side

  6. Clickable Grid Rows

  - Modified: DirectRenderer renderRow function
  - Implementation: Grid onChange triggers → row onClick handlers
  - Context: Passes context.this.value and context.selected for template resolution
  - Result: Row clicks execute setVals + refresh correctly

  7. Form Field Data Binding

  - Modified: DirectRenderer input rendering
  - Implementation: Ultra-simple dataStore lookup by field name
  - Change: Inputs check all dataStore entries for matching fields
  - Result: Form populates when grid row selected ✅

  8. Database Schema Evolution (comp_type & container columns)

  - Added: comp_type column to eventType_xref (references eventType.name)
  - Added: container column to eventType_xref (references eventType.name)
  - Benefit: Self-documenting structure, FK integrity on names
  - Example: comp_type: "Grid", container: "Modal" vs opaque IDs

  📋 Next Steps

  Immediate: Complete Basic CRUD Functionality

  1. Add Submit Button to Forms
    - Auto-generate submit button in form expansion
    - Wire to onSubmit trigger
    - Default label from props or "Submit"
  2. INSERT vs UPDATE Logic
    - Form detects if ID exists in context
    - Changes execDML method: INSERT (no ID) vs UPDATE (has ID)
    - Template: {{context.ingrTypeID ? "UPDATE" : "INSERT"}}
  3. Update Stored Procedures for New Columns
    - Modify joins to use comp_type name instead of eventType_id
    - Add LEFT JOIN for container templates when container != 'inline'
    - Output: container_styles, container_config for wrapper logic

  Strategic: Container Wrapper System

  4. Implement Container Wrapping in DirectRenderer
    - Check if container is not "inline"
    - Look up container eventType (Modal, Section, Drawer, etc.)
    - Wrap component in container template with styles/config
    - Add open/close trigger actions (openContainer, closeContainer)
  5. Test Modal Form Pattern
  UPDATE api_wf.eventType_xref
  SET container = 'Modal'
  WHERE id = 59;  -- ingrTypeForm

  Scalability: Pattern Standardization

  6. Build 2-3 More CRUD Pages
    - Ingredients (child of IngrTypes)
    - Ingredient Batches (child of Ingredients)
    - Identify reusable patterns for automation
  7. Create CRUD Scaffolding Tool
    - Stored procedure: Auto-generate standard CRUD config
    - Input: table name, parent relationship
    - Output: Grid + Form + Queries + Triggers + Props
  8. Field Auto-Generation from Queries
    - Parse SELECT columns from detail query
    - Auto-create form field definitions
    - Store in eventProps.fields

  🏗️ Architecture Patterns Established

  CRUD Page Structure

  Page (onLoad: clearVals + refresh grid)
  ├── Grid (col 1-6)
  │   ├── onRefresh → execEvent(listQuery)
  │   └── onChange → setVals + refresh form
  └── Form (col 7-12)
      ├── onRefresh → execEvent(detailQuery)
      ├── onSubmit → execDML
      └── onSuccess → refresh grid

  Component ID Scoping

  - Parent provides namespace
  - Children use relative IDs
  - Example: ingrTypeGrid → table → thead → header_name

  Data Flow

  1. execEvent stores data in dataStore[componentId]
  2. DirectRenderer binds inputs to dataStore by field name
  3. Triggers pass context with this.value, selected.* for templates

  Clarity Principle

  - Use names over IDs: comp_type: "Grid" not eventType_id: 12
  - Use sqlName over sqlID: execEvent("ingrTypeList") not execEvent("11")
  - Use scoped IDs: table not ingrTypeGrid_table

  🔑 Key Files Modified

  Server:
  - /apps/wf-server/server/controller/execEventType.js - sqlName resolution
  - /apps/wf-server/server/utils/pageConfig/index.js - scoped IDs, page triggers

  Client:
  - /apps/wf-studio/src/rendering/DirectRenderer.jsx - grid layout, row clicks, data binding
  - /apps/wf-studio/src/rendering/WorkflowEngine/triggers/action/execEvent.js - accept name or ID

  Database:
  - api_wf.eventType_xref - added comp_type, container columns
  - api_wf.eventTrigger - converted 7 triggers to use sqlName

  ---
  Enjoy your golf! ⛳ The foundation for database-driven CRUD is solid and working!