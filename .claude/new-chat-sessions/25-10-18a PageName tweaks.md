{pageName} Template CRUD System - 2025-10-18

Focus: Built and debugged fully functional CRUD template with Grid, Form, triggers, visibility control, and runtime context management

---

✅ Major Accomplishments

1. Fixed Critical Rendering Bugs

- Textarea rendering bug - Added 'textarea': 'textarea' to elementMap in /apps/studio/src/rendering/utils/styleUtils.js:33 (was rendering as <div>)
- Form field population - Fixed both input and textarea fields to populate from dataStore using defaultValue with unique keys
- Field clearing on Add New - Updated DirectRenderer to clear form fields when dataStore has empty array

2. Trigger System Architecture

- is_dom_event flag loading - Modified /apps/studio/src/utils/pageConfigBuilder/triggersBuilder.js to lookup is_dom_event from triggers class definitions (not action definitions)
- Made buildWorkflowTriggers async - Loads trigger class definitions from IndexedDB to enrich trigger objects with is_dom_event flags
- Button onClick handlers working - Add New button now properly executes onClick triggers

3. Runtime Visibility System

- Eliminated database pollution - Changed visible action from using setVals (database) to context.contextStore (runtime-only)
- Added contextStore to DirectRenderer - React state for temporary UI toggles that reset on page reload
- Component visibility checking - DirectRenderer checks contextStore[${componentId}_visible] before rendering
- Updated eventHandlerBuilder - Passes contextStore to all trigger executions

4. Trigger Content Type System

- Added content_type ENUM - ('string', 'object', 'array', 'number') to triggers table
- Updated ParamEditor validation - Validates based on content_type, shows appropriate hints
- Simplified trigger formats - execEvent accepts plain string, visible and refresh accept both string and array

5. Props Management Fixes

- Fixed upsertPropByName logic - Now correctly maintains INSERT flag for records with id: null instead of changing to UPDATE
- Prevented character-split corruption - Added Array.isArray() check in loadExistingFields to reject corrupted columnOverrides
- Established columns + columnOverrides pattern - Base schema in columns, UI customizations in columnOverrides

6. Template Trigger Simplifications

- visible.js - Now supports 4 formats: string, object with comp_name, key-value object, array of key-values
- refresh.js - Accepts both string (single component) and array (multiple components)
- Runtime-only visibility - No longer persists to context_store table

---

📊 Statistics

- Files modified: 9
  - DirectRenderer.jsx (visibility, textarea, field clearing)
  - visible.js (runtime context)
  - triggersBuilder.js (is_dom_event lookup)
  - styleUtils.js (textarea mapping)
  - eventHandlerBuilder.js (contextStore passing)
  - ParamEditor.jsx (content_type validation)
  - update.js (upsertPropByName logic)
  - ComponentPropertiesPanel.jsx (loadExistingFields validation)
  - refresh.js (string/array support)
- Bugs fixed: 7
  - Textarea rendering as div
  - Textarea not populating
  - Button onClick not firing
  - is_dom_event always false
  - Props marked UPDATE instead of INSERT
  - Visibility persisting to database
  - Form fields not clearing on Add New
- Database changes: 1
  - Added content_type ENUM column to triggers table
  - Updated triggerList query to include content_type

---

🚀 Next Steps

Immediate (Next Session)

1. Test complete CRUD workflow - Add New → fill form → Submit → verify execDML works
2. Test Grid row selection - Click different rows, verify form updates correctly
3. Clean up debug console.logs - Remove excessive logging from DirectRenderer
4. Update {pageName} template triggers - Convert to new simplified formats (visible, refresh)

Short Term

5. Build template cloning workflow - Hierarchical cloning: {pageName} → recipes with ID reservation/remapping
6. Add Form submit workflow - Verify captureFormData → execDML → refresh chain works
7. Create real CRUD page - Clone template to ingredientTypes page with real table
8. Test visibility toggle - Verify form hides/shows without database writes.
9. DevNote: We need to add action buttons to the {pageName}Grid table for deleteRow and possibly hierDown(navigate to next level in hierarchy. This may be a separate button in the page, if this is simpler. We also may be at the bottom of our hierarchy, in which case this button would not be included or setVisible.false.)

Future

9. Add onLoad trigger to Page - Set initial context values (tableName, method, userID)
10. Implement template substitution - {pageName} → actual page name throughout
11. Build Studio cloning UI - "Clone Template" button in Studio with page name input
    a. DevNote: Will also need app name input.
12. Add form validation - Required fields, data types, constraints

---

💡 Key Learnings

Runtime Context vs Database Context

- Database context_store table - Persistent user preferences that survive reloads
- Runtime context.contextStore - Temporary UI state (visibility, selections) that resets on reload
- Key insight: UI visibility should NOT persist to database - causes pollution and unexpected behavior

Trigger Architecture: Class vs Action

- Class (onClick, onChange, onLoad) - Defines WHEN triggers fire, has is_dom_event flag
- Action (setVals, execDML, visible) - Defines WHAT happens, no is_dom_event flag
- Key insight: Look up is_dom_event by trigger.class, not trigger.action

React defaultValue vs value

- defaultValue - Sets initial value, doesn't update on re-render (uncontrolled)
- value - Sets current value, updates every render (controlled, needs onChange)
- Solution: Use defaultValue + unique key that changes → forces React to recreate element
  a. DevNote: I'm not a fan of the unique key solution, but if that's what it takes... but I'm thinking we the textarea <div> vs <textArea> was the problem.

Element Mapping Completeness

- Missing mappings cause fallback to div - Always check getHtmlElement when adding new component types
- Common mistake: Assuming type="textarea" automatically creates <textarea> - it doesn't!

Data Normalization Patterns

- columns (base schema from DB) + columnOverrides (UI customizations) = merged column config
- Separation of concerns: DB schema separate from UI preferences
- Merging happens in componentBuilder.js before rendering

---

📝 Code Snippets

Visibility Toggle (Runtime Only)

// In visible.js - no database writes
context.contextStore[`${componentId}_visible`] = true;

// In DirectRenderer - check before rendering
if (contextStore[`${id}_visible`] === false) {
return null; // Hide component
}

Field Clearing Pattern

// Check for empty array to clear fields
if (data && Array.isArray(data)) {
hasData = true;
if (data.length > 0) {
fieldValue = data[0][fieldName];
} else {
fieldValue = ''; // Clear on empty array
}
}

Content Type Validation

ALTER TABLE triggers
ADD COLUMN content_type ENUM('string', 'object', 'array', 'number') DEFAULT 'object';

// ParamEditor validates based on type
if (contentType === 'array' && !Array.isArray(parsed)) {
setError('Expected array format: [...]');
}

---

Status: {pageName} template is fully functional with Grid display, row selection, form population, field clearing, and visibility toggling. Ready to test complete CRUD workflow
(Submit button) and build template cloning system. 🚀
