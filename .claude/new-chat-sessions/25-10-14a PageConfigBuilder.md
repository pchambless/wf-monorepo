 Virtual PageConfig Builder & DirectRenderer Enhancement - 2025-10-14

  Focus: Built complete client-side pageConfig generator with Grid/Form/Button components, fixed trigger execution, and implemented compact JSON formatting

  ---
  ✅ Major Accomplishments

  1. Virtual PageConfig Builder - Complete Architecture

  Created modular pageConfig builder system (/apps/studio/src/utils/pageConfigBuilder/):
  - index.js - Main orchestrator builds full pageConfig from IndexedDB
  - componentBuilder.js - Recursive component tree builder with type-specific generators
  - dataFetcher.js - IndexedDB queries with type coercion (string/number normalization)
  - triggersBuilder.js - Transforms database triggers to compact workflowTriggers format
  - positionParser.js - Converts posOrder to position objects
  - formatPageConfig.js - Compact JSON formatter using json-stringify-pretty-compact

  2. Component Generators (Gen Modules)

  genGrid.js - Generates table structure from columns:
  - Creates table/thead/tbody/tr/th/td hierarchy
  - Filters hidden columns from display
  - Generates placeholder row with {fieldName} tokens for data binding
  - Adds column metadata to tbody props for DirectRenderer

  genForm.js - Generates form fields from columns:
  - Creates div/label/input wrappers for each visible column
  - Handles textarea vs input type detection
  - Auto-labels required fields with asterisk
  - Preserves existing children (like submit buttons)

  genButton.js - Generates button label content:
  - Creates span with button label text
  - Defaults to "Submit" if no label specified

  3. Data Structure Improvements

  Column Override Merging (componentBuilder.js:8-31):
  - Merges columnOverrides into columns array
  - Removes defaultValue field for compactness
  - Eliminates redundant columnOverrides property from output

  Table Name Extraction (componentBuilder.js:33-37):
  - Extracts tableName from qrySQL for Form/Grid components
  - Regex parses from schema.table clause
  - Positions tableName after rowKey in props for dmlData operations

  Page Metadata Enhancement (index.js:48-56):
  - Added pageName (comp_name)
  - Uses component.title instead of props override
  - Conditional description field
  - Reordered: metadata first, then layout/triggers/components

  4. Trigger System Fixes

  Type Coercion in Queries (dataFetcher.js:18-26):
  - Fixed getComponentTriggers to normalize xref_id types
  - Handles IndexedDB storing IDs as both string and number
  - Uses .toArray() + .filter() pattern instead of .where().equals()

  Compact Trigger Format (triggersBuilder.js:22-30):
  - Only includes params if value exists (array, object, or string)
  - Supports all three param types properly
  - Maintains sorted order by ordr field

  TriggerEngine Compatibility (TriggerEngine.js:97):
  - Updated to support both trigger.params (new pageConfig format) and trigger.content (old database format)
  - Enables backward compatibility during migration

  5. DirectRenderer Enhancements

  Position Alignment (styleUtils.js:5-25):
  - Added support for align property in position object
  - align: "right" → marginLeft: "auto"
  - align: "center" → marginLeft: "auto" + marginRight: "auto"
  - Button now properly right-aligns at 25% width

  Container Property Removal (componentBuilder.js:65):
  - Removed redundant container property from component configs
  - Parent comp_type provides sufficient context

  6. TriggerBuilder UI Fixes

  Added Missing Event Handlers (TriggerBuilder.jsx:103-150):
  - handleAddAction() - Creates new trigger with dropdown selection
  - handleEditAction() - Prompts for action name and params (temporary solution)
  - handleDeleteAction() - Marks trigger as deleted with confirmation
  - Added action dropdown (mirrors class dropdown pattern)

  Component Name Display (ComponentPropertiesPanel.jsx:730):
  - Fixed modal title to show component name
  - Fallback chain: comp_name → title → label → "Unknown Component"
  - Added debug logging to diagnose missing properties

  7. Compact JSON Formatting

  Installed & Integrated json-stringify-pretty-compact:
  - Package: json-stringify-pretty-compact@4.0.0
  - Max line length: 150 characters
  - Keeps trigger actions on one line: {"action": "clearVals", "params": ["ingrTypeID"]}
  - Keeps column definitions on one line: {"name": "id", "dataType": "int", "hidden": true}

  ---
  📊 Statistics

  - Files created: 6
    - 5 pageConfigBuilder modules (index, componentBuilder, dataFetcher, triggersBuilder, positionParser, formatPageConfig)
    - 3 generator modules (genGrid, genForm, genButton)
  - Files modified: 6
    - TriggerEngine.js (params/content compatibility)
    - TriggerBuilder.jsx (event handlers + dropdown)
    - ComponentPropertiesPanel.jsx (component name display)
    - PagePreviewPanel.jsx (compact formatter integration)
    - DirectRenderer styleUtils.js (position alignment)
  - Functions added: 15
    - buildPageConfig, buildComponentConfig, buildWorkflowTriggers
    - getComponent, getChildComponents, getComponentProps, getComponentTriggers (with type coercion)
    - generateGridComponents, generateFormComponents, generateButtonComponents
    - mergeColumnOverrides, extractTableNameFromQuery, formatPageConfig
    - handleAddAction, handleEditAction, handleDeleteAction
  - Type coercion fixes: 3 critical IndexedDB query fixes
  - Bugs fixed: 5
    - Page-level triggers not loading (type coercion)
    - Trigger params undefined (params vs content)
    - Button not rendering (missing children)
    - Button not right-aligning (missing align support)
    - TriggerBuilder buttons not working (missing onClick handlers)

  ---
  🚀 Next Steps

  Immediate (Next Session)

  1. Smart Param Editor - Build schema-based form editor for trigger params
    - Use param_schema from triggers table
    - Replace prompt() dialogs with proper modal forms
    - Validate inputs against JSON schema
    - Handle different param types (string, array, object, enum)
  2. Test Sync to Server - Verify pageConfig writes to production
    - Click "Sync to Server" button
    - Confirm files written to /apps/whatsfresh/src/pages/ingrType/
    - Verify pageConfig.json format matches expectations
    - Test generated index.jsx imports DirectRenderer correctly
  3. Test Full Workflow - End-to-end page rendering
    - Create new page in Studio
    - Add Grid and Form components
    - Configure triggers (onLoad, onRefresh, onSubmit)
    - Preview in PagePreviewPanel
    - Sync to production
    - Test in actual WhatsFresh app
  4. Remove Debug Logging - Clean up console statements
    - componentBuilder.js (lines 26, 46)
    - index.js (lines 8-26)
    - ComponentPropertiesPanel.jsx (line 724)

  Short Term

  5. Add Validation - Ensure pageConfig structure is valid before sync
    - Required fields check (pageName, routePath, components)
    - Trigger action validation against available actions
    - Column schema validation for Grid/Form
  6. Handle Missing DirectRenderer Path - Update import path in generated index.jsx
    - Detect app structure to determine correct relative path
    - Different for apps/whatsfresh vs apps/studio
  7. Generate Mermaid Diagram - Create pageMermaid.mmd for visualization
    - Component hierarchy tree
    - Workflow trigger flow diagram
  8. Cache PageConfig - Store built config to avoid rebuilding on tab switch
    - Use React state to cache result
    - Invalidate on refresh button click

  Future

  9. AppBar Component - Auto-display page title
    - Add AppBar as row 0 component
    - Consume title from pageConfig root
    - Standardize across all pages
  10. PageConfig Diff Viewer - Show changes since last sync
    - Load previous version from production
    - Highlight additions/deletions/modifications
  11. Drag-to-Reorder Triggers - Better UX for trigger order management
    - Replace manual order editing
    - Drag handles in action list
  12. Param Editor Templates - Common patterns for execDML, execEvent
    - Quick-fill buttons for common operations
    - Template library for frequent use cases
  13. Column Visibility - Remove nullable field if not critical
    - Further reduce pageConfig size
    - Reassess which fields are truly necessary

  ---
  💡 Key Learnings

  IndexedDB Type Coercion in Dexie

  Problem: Dexie queries use strict equality (===), but IndexedDB data types vary
  - id stored as number, passed as string from React state
  - parent_id stored as string in some records, number in others
  - .get(id) looks up by primary key (idbID), not the id field
  - .where('xref_id').equals(xref_id) fails with type mismatch

  Solution: Normalize types before comparison
  const numericId = typeof xref_id === 'string' ? parseInt(xref_id, 10) : xref_id;
  const allComponents = await db.eventComp_xref.toArray();
  const component = allComponents.find(c => c.id === numericId);

  Key Insight: Use .toArray() + .find()/.filter() with manual type normalization instead of relying on Dexie's .where().equals() when type consistency is uncertain.

  Client-Side PageConfig Builder Pattern

  Why this architecture works:
  - Single source of truth - Studio builds once, server just writes files
  - Faster iteration - Preview without server round-trip
  - Easier debugging - Full pageConfig visible in browser console
  - Simpler server - Becomes a file writer, no complex business logic

  Key Decision: Separation of concerns
  - Studio = pageConfig composition + validation + preview
  - Server = file system writes + deployment
  - DirectRenderer = runtime interpretation + workflow execution

  Tradeoff: Larger pageConfig files vs. runtime template merging. We chose self-contained configs for portability and clarity.

  Modular Builder Structure

  Pattern: Small, focused modules with single responsibilities
  dataFetcher.js      → IndexedDB queries only
  componentBuilder.js → Component tree recursion + generator orchestration
  triggersBuilder.js  → Trigger transformation logic
  positionParser.js   → Layout parsing
  genGrid.js          → Grid-specific HTML structure
  genForm.js          → Form-specific field generation
  genButton.js        → Button label generation
  index.js            → High-level orchestration

  Benefits:
  - Easy to test individual functions in isolation
  - Clear dependency graph (no circular dependencies)
  - Simple to extend (add new comp_type? Create new genX.js)
  - Follows CLAUDE.md modularization principle (>300 lines = split)

  Compact JSON Formatting Strategy

  Challenge: Balance readability with file size

  Solution: json-stringify-pretty-compact with maxLength: 150
  - Small objects (triggers, columns) stay on one line
  - Large objects (components with children) expand normally
  - Manual control over indentation (2 spaces)

  Result:
  "workflowTriggers": {
    "onLoad": [
      {"action": "clearVals", "params": ["ingrTypeID", "ingrID", "ingrBtchID"]},
      {"action": "refresh", "params": ["ingrTypeGrid"]}
    ]
  }

  Key Insight: Don't try to manually format with regex. Use a library designed for compact JSON. Tune maxLength based on viewport width.

  Type-Safe Recursive Component Building

  Challenge: Recursive functions must handle type inconsistencies at every level
  - Component IDs, parent IDs, xref_ids all need normalization
  - Can't assume types will be consistent across hierarchy

  Solution: Normalize at entry point of each function
  export const buildComponentConfig = async (component, level = 0) => {
    // Normalize ID immediately
    const numericId = typeof component.id === 'string'
      ? parseInt(component.id, 10)
      : component.id;

    // Use normalized value for ALL subsequent queries
    const props = await getComponentProps(numericId);
    const children = await getChildComponents(numericId);
    // ...
  };

  Principle: Trust nothing from external storage. Normalize early, use consistently.

  DirectRenderer Design Philosophy

  Observation: DirectRenderer has NO special cases for Grid or Form
  - It just recursively renders the component tree
  - No "if (comp_type === 'Grid')" logic
  - Completely generic and declarative

  Implication: All complexity must be in the component tree structure
  - Grid needs full table/thead/tbody/tr/th/td children
  - Form needs full div/label/input field wrappers
  - Button needs textContent children

  Architecture Decision: Generate complete DOM structure in pageConfigBuilder
  - ✅ Keeps DirectRenderer simple and generic
  - ✅ PageConfig is self-documenting (full tree visible)
  - ✅ Easier debugging (see exact HTML structure in JSON)
  - ❌ Larger pageConfig files (but JSON compresses well)
  - ❌ More complex builder logic (but written once, used forever)

  Alternative Considered: Make DirectRenderer "smart" about Grid/Form
  - Would reduce pageConfig size
  - But adds coupling and comp_type-specific logic to renderer
  - Harder to extend with new component types
  - Rejected in favor of "dumb renderer, smart builder" pattern

  ---
  📝 Code Snippets

  Type-Coerced IndexedDB Query Pattern

  // GOOD: Type-safe query with normalization
  export const getComponent = async (xref_id) => {
    const numericId = typeof xref_id === 'string' ? parseInt(xref_id, 10) : xref_id;
    const allComponents = await db.eventComp_xref.toArray();
    return allComponents.find(c => c.id === numericId);
  };

  // BAD: Direct query assumes type match
  export const getComponent = async (xref_id) => {
    return await db.eventComp_xref.where('id').equals(xref_id).first();
    // Fails if xref_id is string but id is stored as number
  };

  Compact Trigger Format Builder

  // Build workflowTriggers with conditional params
  const triggerObj = { action: trigger.action, _order: trigger.ordr || 0 };

  if (params !== null && params !== undefined) {
    if (Array.isArray(params) && params.length > 0) {
      triggerObj.params = params;  // ["ingrTypeGrid"]
    } else if (typeof params === 'object' && Object.keys(params).length > 0) {
      triggerObj.params = params;  // {"method": "INSERT"}
    } else if (typeof params === 'string' && params.length > 0) {
      triggerObj.params = params;  // "ingrTypeList"
    }
  }

  Component Generator Pattern

  // Pattern for all genX.js modules
  export const generateXComponents = (props, componentId, existingChildren = []) => {
    const { relevantProp1, relevantProp2 } = props;

    if (!relevantProp1) {
      return existingChildren; // No generation needed
    }

    const generatedChildren = buildStructure(relevantProp1, relevantProp2);

    // Prepend or append based on component type
    return [...generatedChildren, ...existingChildren]; // or reverse
  };