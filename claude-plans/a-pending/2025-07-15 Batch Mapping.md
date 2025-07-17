# Batch Mapping - Navigation & Component Architecture

## User Idea
Fix the btchMapping page representation in our system architecture. Currently shows as separate pages in mermaid charts, but it's actually a single page with multiple interactive UI components that don't follow standard navigation patterns.

**Current Issue:**
- btchMapRcpeList, btchMapAvailable, btchMapMapped appear as separate pages
- They're actually UI components within single btchMapping page
- Complex drag-and-drop interactions between components
- Component-level data flow vs navigation flow needs proper representation

## Navigation Strategy (Updated)

### Enhanced Sidebar Mapping Section
```
📍 MAPPING
├── 🔽 Select Product [SelProd dropdown]
└── 📋 Product Batches → [Links to prodBtchList filtered by selected product]
```

### User Workflow (Product-Centric)
1. **Product Selection**: User selects product in sidebar dropdown
2. **Batch Management**: Click "Product Batches" → goes to prodBtchList (filtered by selected product)
3. **Batch Operations**: Either:
   - **Existing batch**: Select batch → click "Mapping" action → btchMapping page
   - **New batch**: Click "Add" → create batch → click "Mapping" action → btchMapping page

### Benefits
- **Single entry point**: All mapping workflows go through prodBtchList
- **Consistent UX**: Users always see their batches before mapping
- **Context awareness**: prodBtchList pre-filtered by sidebar product selection
- **Flexibility**: Create new OR select existing in same interface

## BatchMapping Page Architecture

### High-Level Workflow
1. **prodBtchID Context**: Established from prodBtchList navigation (or direct selection if accessed directly)
2. **Page Load**: gridRcpe populated with recipe ingredients for selected product batch
3. **Recipe Ingredient Selection**: User selects row → populates both:
   - gridMapped (already mapped batches for this ingredient)
   - gridAvailable (available batches for this ingredient)
4. **Interactive Operations**:
   - **Map**: Drag gridAvailable → gridMapped
   - **Unmap**: Drag gridMapped → gridAvailable  
   - **Edit**: Select gridMapped row → Edit form (ingredient_quantity, measure_id, comments)
5. **Report Generation**: Product Batch Worksheet (available any time)

### Multi-Grid Component Structure
- **gridRcpe** (Left): Recipe ingredients list - click to select ingredient
- **gridAvailable** (Top-Right): Available ingredient batches - drag to map
- **gridMapped** (Bottom-Right): Mapped ingredient batches - drag to unmap, click to edit quantities

### Data Sources Required
- **btchMapRcpeList.sql** ✅ (already exists)
- **btchMapAvailable.sql** (need to create)
- **btchMapMapped.sql** (need to create)

### Future Scope
- **ProdBtchTasks**: Separate plan/implementation (may be tab in this page or separate modal)

## Implementation Impact Analysis

### Impact Summary
- **Files**: 26 (see impact-tracking.json: plan_id="2025-07-15-batch-mapping")
- **Complexity**: High (drag/drop UI, multi-grid interactions)
- **Packages**: apps/wf-client (12), packages/devtools (4), sql/views (2), shared-imports (2)
- **Blast Radius**: MAPPING (low), DEVTOOLS (medium)

### Impact Tracking Status
- **Predicted**: 25 files
- **Actual**: 26 files (+1 discovered)
- **Accuracy**: 96%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`

### Plan Dependencies
- **Blocks**: None identified
- **Blocked by**: 2025-07-15 Batch Mapping SQL Views Creation (SQL views must exist first)
- **Related**: None currently
- **File Conflicts**: None identified

### Estimated Complexity
- **Backend/API**: Medium complexity (standard CRUD operations)
- **Frontend/UI**: High complexity (multi-grid interactions, drag/drop)
- **DevTools**: Medium complexity (custom layout support)
- **Navigation**: Low complexity (sidebar enhancements)

### Related Plan Dependencies
- **Universal DML Processor**: Separate plan needed for `execDML` endpoint enhancement
  - Takes `dmlConfig` from pageMap
  - Determines INSERT/UPDATE/DELETE operation type
  - Builds DML statements with field-to-column mapping
  - Executes against database with resolved values
  - **Scope**: This is a foundational feature needed across all CRUD operations, not specific to batch mapping