# vw_module_map

**Location:** `apps/studio/src/sql/database/api_wf/views/vw__module_map.sql`

## Purpose

Maps parent-child module dependencies showing which files import which other files. Tracks both internal (same package) and external (cross-package) dependencies.

## Key Columns

- `parent_package`, `child_package` - Package names for each side of dependency
- `parent_file`, `child_file` - File names
- `parent_path`, `child_path` - Full file paths
- `crossed` - 'Internal' (same package) or 'External' (cross-package)
- `status` - 'Valid' (both active) or 'Obsolete' (one or both deleted)
- `child_id`, `parent_id` - Module IDs for joins
- `active_parent`, `active_child` - Individual active flags (1/0)
- `parent_detected_at`, `child_detected_at` - Last seen timestamps

## Common Query Patterns

### Find all dependencies of a file (what does this import?)
```sql
SELECT child_file, child_path, crossed, status
FROM api_wf.vw_module_map
WHERE parent_file = 'DirectRenderer.jsx'
ORDER BY crossed, child_file;
```

### Find all dependents of a file (what imports this?)
```sql
SELECT parent_file, parent_path, crossed, status
FROM api_wf.vw_module_map
WHERE child_file = 'contextStore.js'
ORDER BY crossed, parent_file;
```

### Find cross-package dependencies (blast radius analysis)
```sql
SELECT parent_package, parent_file, child_package, child_file
FROM api_wf.vw_module_map
WHERE crossed = 'External'
  AND status = 'Valid'
ORDER BY parent_package, parent_file;
```

### Find orphaned/obsolete dependencies (cleanup candidates)
```sql
SELECT parent_file, child_file,
       active_parent, active_child
FROM api_wf.vw_module_map
WHERE status = 'Obsolete'
ORDER BY parent_file;
```

### Find high-impact modules (many dependents)
```sql
SELECT child_file, COUNT(*) as dependent_count
FROM api_wf.vw_module_map
WHERE status = 'Valid'
GROUP BY child_file
ORDER BY dependent_count DESC
LIMIT 20;
```

### Package coupling analysis
```sql
SELECT
  parent_package,
  child_package,
  COUNT(*) as dependency_count
FROM api_wf.vw_module_map
WHERE crossed = 'External'
  AND status = 'Valid'
GROUP BY parent_package, child_package
ORDER BY dependency_count DESC;
```

## Use Cases

- **Blast radius:** "If I change this file, what breaks?"
- **Refactoring safety:** "Can I safely delete this module?"
- **Architecture analysis:** "Which packages are too tightly coupled?"
- **Dead code detection:** "Are there obsolete dependencies to clean up?"
- **Critical path identification:** "Which modules have the most dependents?"
- **Import optimization:** "Can we reduce cross-package dependencies?"

## Notes

- `status = 'Valid'` means both parent and child are currently active/tracked
- `status = 'Obsolete'` means at least one side was soft-deleted
- `crossed = 'External'` indicates potential architectural boundaries
- Based on `module_xref` join table between `modules` entries
