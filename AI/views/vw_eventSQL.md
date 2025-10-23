# vw_eventSQL

**Location:** `apps/studio/src/sql/database/api_wf/views/vw_eventSQL.sql`

## Purpose

Links UI components to their SQL queries via the `execEvent` action. Shows which components execute which named queries from the `eventSQL` table.

## Key Columns

- `xref_id` - Component cross-reference ID
- `comp_name` - Component name
- `comp_type` - Component type
- `qryName` - Named query identifier (e.g., 'sessionRecentList')
- `qrySQL` - Full SQL query text

## Common Query Patterns

### Find which component executes a query
```sql
SELECT comp_name, comp_type, qryName
FROM api_wf.vw_eventSQL
WHERE qryName = 'sessionRecentList';
```

### See all queries used by a component
```sql
SELECT qryName, qrySQL
FROM api_wf.vw_eventSQL
WHERE comp_name = 'DashboardGrid';
```

### List all components that execute SQL
```sql
SELECT comp_name, comp_type, COUNT(*) as query_count
FROM api_wf.vw_eventSQL
GROUP BY comp_name, comp_type
ORDER BY query_count DESC;
```

### Find unused queries (NOT in this view)
```sql
SELECT qryName
FROM api_wf.eventSQL
WHERE qryName NOT IN (SELECT qryName FROM api_wf.vw_eventSQL);
```

### Query by component type
```sql
SELECT comp_name, qryName
FROM api_wf.vw_eventSQL
WHERE comp_type = 'grid'
ORDER BY comp_name;
```

## Use Cases

- **Query discovery:** "What query does this component use?"
- **Component-SQL mapping:** "Which components call this query?"
- **Refactoring impact:** "What breaks if I change this query?"
- **Dead query detection:** "Which queries are never used?"
- **Performance analysis:** "What SQL runs when this component loads?"
- **Documentation:** "Map UI to database queries"

## Notes

- Only includes components with `action = 'execEvent'` triggers
- Filters to `WHERE c.id is not null` (only shows linked queries)
- `qryName` comes from trigger `content` field
- Joins through `vw_hier_components` → `eventTrigger` → `eventSQL`
- Missing queries (broken references) won't appear in this view
