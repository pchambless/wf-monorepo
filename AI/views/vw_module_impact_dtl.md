# vw_module_impact_dtl

**Location:** `apps/studio/src/sql/database/api_wf/views/vw_module_impact_dtl.sql`

## Purpose

Links tracked modules with their modification history from plan_impacts. Shows which files were changed, when, by whom, and as part of which plan.

## Key Columns

- `fileName`, `fileFolder`, `file_path` - Module identity
- `active` - Module tracking status (1 = currently tracked)
- `impact` - Description of what changed
- `plan_id`, `plan_name`, `plan_status` - Plan linkage
- `change_type` - CREATE, MODIFY, DELETE, ANALYZE, DISCOVER, etc.
- `batch_id` - Who/when grouping (format: "claude-2025-10-21 1335")
- `affected_apps` - Array of app names impacted by the change

## Common Query Patterns

### View all changes to a specific file
```sql
SELECT batch_id, impact, plan_name, change_type
FROM api_wf.vw_module_impact_dtl
WHERE fileName = 'DirectRenderer.jsx'
ORDER BY batch_id DESC;
```

### Find hot spots (most frequently changed files)
```sql
SELECT fileName, COUNT(*) as change_count
FROM api_wf.vw_module_impact_dtl
GROUP BY fileName
ORDER BY change_count DESC
LIMIT 20;
```

### See all impacts for a specific plan
```sql
SELECT fileName, impact, change_type, affected_apps
FROM api_wf.vw_module_impact_dtl
WHERE plan_id = 42
ORDER BY fileName;
```

### Find files touched by multiple AIs (coordination points)
```sql
SELECT
  fileName,
  GROUP_CONCAT(DISTINCT SUBSTRING_INDEX(batch_id, '-', 1)) as agents,
  COUNT(*) as total_changes
FROM api_wf.vw_module_impact_dtl
GROUP BY fileName
HAVING COUNT(DISTINCT SUBSTRING_INDEX(batch_id, '-', 1)) > 1
ORDER BY total_changes DESC;
```

### Recent changes across all modules
```sql
SELECT fileName, impact, batch_id, plan_name
FROM api_wf.vw_module_impact_dtl
ORDER BY batch_id DESC
LIMIT 50;
```

## Use Cases

- **Debugging:** "When was this file last changed and why?"
- **Code archaeology:** "How did we get to this state?"
- **AI Coordination:** "What files have both Claude and Kiro touched?"
- **Impact analysis:** "What's the blast radius of past changes to this module?"
- **Planning:** "Which files get modified most often?" (refactor candidates)
- **Quality metrics:** "How many times has this file been fixed?" (architectural smell detection)

## Notes

- Only shows modules where `active = 1` (currently tracked files)
- Ordered by `fileFolder` in the base view
- `batch_id` provides natural grouping for related changes in a single session
