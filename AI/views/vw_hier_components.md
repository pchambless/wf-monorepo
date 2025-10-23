# vw_hier_components

**Location:** `apps/studio/src/sql/database/api_wf/views/vw_hier_components.sql`

## Purpose

Hierarchical view of UI components showing parent-child relationships, component metadata, and positioning. Foundation view used by other views like `vw_eventTrigger`.

## Key Columns

- `xref_id` - Unique component cross-reference ID
- `parent_name` - Parent component name (from function `f_xrefParent`)
- `comp_name` - Component name
- `parentCompName` - Fully qualified name (parent.comp_name)
- `title` - Display title/label
- `comp_type` - Component type (button, form, input, etc.)
- `container` - Container/layout position
- `posOrder` - Position ordering within container
- `override_styles` - Custom style overrides
- `description` - Component description

## Common Query Patterns

### Find all children of a parent component
```sql
SELECT comp_name, comp_type, title, posOrder
FROM api_wf.vw_hier_components
WHERE parent_name = '{pageName}Container'  -- Provide parent_name
ORDER BY posOrder;
```

### Find component by fully qualified name
```sql
SELECT *
FROM api_wf.vw_hier_components
WHERE parentCompName = 'UserForm.SaveButton';
```

### List all components of a specific type
```sql
SELECT parent_name, comp_name, title
FROM api_wf.vw_hier_components
WHERE comp_type = 'button'  -- provide a comp_type
ORDER BY parent_name, comp_name;
```

### Component hierarchy tree
```sql
SELECT parent_name, comp_name, comp_type, container, posOrder
FROM api_wf.vw_hier_components
ORDER BY parent_name, posOrder;
```

### Find components with custom styles
```sql
SELECT parentCompName, comp_type, override_styles
FROM api_wf.vw_hier_components
WHERE override_styles IS NOT NULL
ORDER BY parent_name;
```

## Use Cases

- **UI structure analysis:** "What's the component hierarchy?"
- **Component discovery:** "Where is this button defined?"
- **Layout debugging:** "What's the render order?"
- **Component inventory:** "List all forms/buttons/inputs"
- **Style audit:** "Which components have custom overrides?"
- **Parent-child navigation:** "What are the children of this container?"

## Notes

- Only shows `active = 1` components
- Excludes self-referential entries (`parent_name <> comp_name`)
- Uses function `f_xrefParent()` to resolve parent names
- `parentCompName` provides dot-notation path (like React component hierarchy)
- Ordered by parent, component name, and position for consistent hierarchy display

## DevNotes:
- a complete hierarchy tree for any xref_id (anywhere in the hierarchy) can be achieved
  by running the following:  
   CALL api_wf.sp_hier_structure(:xrefID) - provide an xref_id: 
   
### example 
   CALL api_wf.sp_hier_structure(65) 
   
   returns all the components below '{pageName}Container' in hierarchy order.
