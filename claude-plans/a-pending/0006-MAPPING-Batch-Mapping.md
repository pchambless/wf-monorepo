# MAPPING - Batch Mapping

## User Idea
Implement the batch mapping page with multi-grid drag-and-drop interface for mapping ingredient batches to product batches. This is a complex interactive page that allows users to:
- Select recipe ingredients from a list
- View available ingredient batches for mapping
- Drag/drop batches between available and mapped grids
- Edit quantities and measures for mapped batches
- Generate product batch worksheets

**Current Status**: SQL views created, need to implement the UI components and interactions.

## Implementation Impact Analysis

### Impact Summary
- **Plan ID**: 0006
- **Files**: ~20 (see impact-tracking.json: plan_id="0006")
- **Complexity**: High (drag/drop UI, multi-grid interactions)
- **Packages**: wf-client (12), shared-imports (4), devtools (4)
- **Blast Radius**: MAPPING (low), DEVTOOLS (medium), SHARED (medium)

### Impact Tracking Status
- **Predicted**: ~20 files
- **Actual**: TBD files (work in progress)
- **Accuracy**: TBD%
- **JSON Reference**: All detailed tracking in `/claude-plans/impact-tracking.json`
- **Status**: ACTIVE - Forward-looking implementation plan

### Plan Dependencies
- **Blocks**: None identified - specialized mapping functionality
- **Blocked by**: SQL views creation (completed - gridRcpe.sql, gridMapped.sql, gridAvailable in eventTypes.js)
- **Related**: Universal DML Processor (separate plan needed for execDML endpoint)
- **File Conflicts**: None identified

## Implementation Strategy

### Phase 1: Core Page Structure
- Create btchMapping page with multi-grid layout
- Implement gridRcpe (recipe ingredients) with selection handling
- Set up basic navigation from prodBtchList → btchMapping
- Establish prodBtchID context management

### Phase 2: Navigation Integration
- Update sidebar with product selection dropdown (see /home/paul/wf-monorepo-new/apps/wf-client/src/config/navigation.js)
- Enhance prodBtchList with "Mapping" action buttons
- Test complete workflow: product selection → batch list → mapping page
- Success:  gridRcpe is populated. (Will need to trigger execEvent("gridRcpe") upon SelProd selection in Sidebar.)

**CURRENT ISSUE**: SelProd parameter resolution failing
- **Problem**: prodID parameter being sent as literal ":prodID" instead of actual selected value
- **Server Log**: `POST /api/execEventType Event: prodBtchList, Params: { ":prodID": ":prodID" }`
- **Root Cause**: Navigation flow not properly triggering prodBtchList after SelProd selection
- **Investigation**: ContextStore working correctly, issue is in navigation triggering mechanism 

### Phase 3: Grid Interactions
- Implement gridAvailable and gridMapped components
- Add drag-and-drop functionality between grids
- Create ingredient selection → grid population logic
- Handle map/unmap operations with state management

### Phase 4: Edit & Operations
- Add edit functionality for mapped batches (quantity, measure, comments)
- Implement batch worksheet generation
- Add validation and error handling
- Integrate with backend DML operations


## Next Steps

### Immediate Priority
1. **Investigate Current State**: Review existing SQL views and any partial implementation
2. **Design Multi-Grid Layout**: Create wireframe for 3-grid interface (recipe, available, mapped)
3. **Create Page Structure**: Set up btchMapping page with basic grid placeholders
4. **Implement Grid Components**: Start with gridRcpe (recipe ingredients) selection

### Implementation Phases
1. **Phase 1**: Core page structure and recipe ingredient selection
2. **Phase 2**: Available/mapped grids with drag-and-drop functionality
3. **Phase 3**: Edit operations and batch worksheet generation
4. **Phase 4**: Navigation integration and end-to-end testing

### Success Criteria
- Users can navigate from prodBtchList to btchMapping with context
- Recipe ingredients display and allow selection
- Available batches populate based on selected ingredient
- Drag-and-drop mapping/unmapping works smoothly
- Edit form allows quantity/measure adjustments
- Product batch worksheet generates correctly
