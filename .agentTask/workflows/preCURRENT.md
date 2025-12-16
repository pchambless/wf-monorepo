# Migrate eventProps and eventTrigger data to eventComp_xref JSON columns

## Description
Migrate all props and triggers for each component xref into their new JSON columns (`props`, `triggers`) on the `eventComp_xref` table. Remove legacy per-prop/trigger tables once confirmed safe.

## Steps

1. Review and back up current tables: `eventComp_xref`, `eventProps`, `eventTrigger`.
2. Ensure eventComp_xref has new `props` (JSON), `triggers` (JSON) columns.
3. For each distinct `eventComp_xref.id`:
    - Gather all props as `{ propName: propVal, ... }` JSON
    - Gather all triggers as `[ { triggerType, triggerConf, ordr }, ... ]` array
4. Write/update props/triggers JSON on each eventComp_xref row.
5. Validate:
    - Confirm for 5 random xrefs that new columns match merged old tables.
6. Commit migration script in `/migrations` (if relevant).
7. Review with team before dropping old tables.

## Example SQL Snippet

```sql
-- Step 1: Update props
UPDATE eventComp_xref x
SET props = (
  SELECT JSON_OBJECTAGG(ep.propName, ep.propVal)
  FROM eventProps ep
  WHERE ep.eventComp_xref_id = x.id
);

-- Step 2: Update triggers
UPDATE eventComp_xref x
SET triggers = (
  SELECT JSON_ARRAYAGG(
    JSON_OBJECT('triggerType', et.triggerType, 'triggerConf', et.triggerConf, 'ordr', et.ordr)
  )
  FROM eventTrigger et
  WHERE et.eventComp_xref_id = x.id
);
```