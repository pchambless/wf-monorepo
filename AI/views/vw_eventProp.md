# vw_eventProp

**Location:** `apps/studio/src/sql/database/api_wf/views/vw_eventProp.sql`

## Purpose

Shows component properties (props) and their values. Links component metadata with parameter configurations, essential for understanding component state and configuration.

## Key Columns

- `prop_id` - Unique property identifier
- `xref_id` - Component cross-reference ID
- `parent_id` - Parent component ID
- `comp_type` - Component type (button, input, form, etc.)
- `comp_name` - Component name
- `paramName` - Property/parameter name (e.g., 'label', 'placeholder', 'disabled')
- `paramVal` - Property value

## Common Query Patterns

### Find all props for a component
```sql
SELECT prop_id, paramName, paramVal
FROM api_wf.vw_eventProp
WHERE comp_name = 'ingrTypeGrid'  -- Provide comp_name
ORDER BY paramName;
```

### Find components with a specific property
```sql
SELECT prop_id, comp_name, comp_type, paramVal
FROM api_wf.vw_eventProp
WHERE paramName = 'label'  -- Provide paramName
ORDER BY comp_name;
```

### Find all properties of a component type
```sql
SELECT prop_id, comp_name, paramName, paramVal
FROM api_wf.vw_eventProp
WHERE comp_type = 'button'  -- Provide comp_type
ORDER BY comp_name, paramName;
```

### Search by property value
```sql
SELECT prop_id, comp_name, paramName, paramVal
FROM api_wf.vw_eventProp
WHERE paramVal LIKE '%Submit%'  -- Provide search pattern
ORDER BY comp_name;
```

### Component configuration dump
```sql
SELECT prop_id, comp_name, GROUP_CONCAT(CONCAT(paramName, '=', paramVal) SEPARATOR ', ') as config
FROM api_wf.vw_eventProp
WHERE comp_name = '{pageName}Form'  -- Provide comp_name
GROUP BY prop_id, comp_name;
```

### Find disabled components
```sql
SELECT comp_name, comp_type, paramName, paramVal
FROM api_wf.vw_eventProp
WHERE paramName = 'selectable' AND paramVal = 'true' -- provide paramName and paramVal
ORDER BY comp_name;
```

## Use Cases

- **Component configuration:** "What props are set on this button?"
- **UI audit:** "Which components have placeholder text?"
- **Debugging:** "Why is this field disabled?"
- **Configuration search:** "Find all components with label 'Submit'"
- **Component inventory:** "List all required fields"
- **Property analysis:** "Which components use custom validators?"

## Notes

- Joins `eventProps` with `vw_hier_components`
- Ordered by `xref_id` and `paramName` for consistent grouping
- Property values stored as strings in `paramVal`
- Common properties: label, placeholder, required, disabled, defaultValue, validation
