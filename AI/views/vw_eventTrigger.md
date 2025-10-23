# vw_eventTrigger

**Location:** `apps/studio/src/sql/database/api_wf/views/vw_eventTrigger.sql`

## Purpose

Complete workflow execution chain showing how UI components trigger actions (events) that route to APIs, workflows, and controllers. Essential for understanding event flow and impact traceability.

## Key Columns

- `trigger_id` - Unique trigger identifier
- `xref_id` - Component cross-reference ID
- `parent_id`, `comp_name`, `comp_type` - Component identity
- `ordr` - Execution order for multiple triggers on same component
- `class` - Event class (e.g., 'onClick', 'onSubmit', 'onLoad')
- `action` - Action to execute (e.g., 'execEvent', 'navigate', 'setState')
- `api_id` - API endpoint ID (if action routes to API)
- `wrkFlow_id` - Workflow ID (if action triggers workflow)
- `controller_id` - Server controller ID (if action routes to controller)
- `is_dom_event` - Boolean flag for DOM vs custom events
- `content` - Additional trigger content/parameters

## Common Query Patterns

### Find all triggers for a component
```sql
SELECT comp_name, class, action, api_id, wrkFlow_id, controller_id
FROM api_wf.vw_eventTrigger
WHERE comp_name = :comp_name -- provide a component
ORDER BY ordr;
```

### Find what triggers a specific action
```sql
SELECT comp_name, comp_type, class, content
FROM api_wf.vw_eventTrigger
WHERE action = :action -- provide an action
ORDER BY comp_name;
```

### Map component → API route
```sql
SELECT comp_name, class, action, wrkFlow_id, api_id, controller_id
FROM api_wf.vw_eventTrigger
WHERE api_id IS NOT NULL
ORDER BY comp_name;
```

### Find workflow triggers
```sql
SELECT comp_name, class, action, wrkFlow_id
FROM api_wf.vw_eventTrigger
WHERE wrkFlow_id IS NOT NULL
ORDER BY comp_name;
```

### Execution order analysis
```sql
SELECT comp_name, ordr, class, action
FROM api_wf.vw_eventTrigger
WHERE comp_name = :comp_name -- provide a comp_name
ORDER BY ordr;
```

### Find DOM event handlers
```sql
SELECT comp_name, class, action, content
FROM api_wf.vw_eventTrigger
WHERE is_dom_event = 1
ORDER BY comp_name;
```

## Use Cases

- **Debugging:** "What happens when I click this button?"
- **Impact analysis:** "Which components call this API?"
- **Architecture mapping:** "How does UI connect to backend?"
- **Workflow tracing:** "What triggers this workflow?"
- **Event flow documentation:** "Document the complete event chain"
- **Refactoring safety:** "What breaks if I change this controller?"

## Notes

- Joins `eventTrigger` with `vw_hier_components` and `triggers` tables
- `api_id`, `wrkFlow_id`, `controller_id` provide complete routing context
- `ordr` field handles multiple triggers on same component
- `is_dom_event` distinguishes native DOM events from custom application events
