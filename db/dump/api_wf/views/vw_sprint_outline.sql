CREATE OR REPLACE VIEW api_wf.vw_sprint_outline AS
WITH sprint_data AS (
  SELECT
    p.id,
    p.name,
    p.agile,
    p.status,
    p.priority,
    p.parentID,
    p.created_at,
    p.updated_at,
    p.parentID AS epic_id,  -- Simplified: epics have parentID = id, sprints have parentID = epic_id
    CASE
      WHEN p.agile = 'epic' THEN 0
      ELSE 1
    END AS is_sprint
  FROM plans p
  WHERE p.active = 1
    AND p.deleted_at IS NULL
),
epic_stats AS (
  SELECT
    epic_id,
    COUNT(*) AS total_sprints,
    SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) AS completed_sprints,
    SUM(CASE WHEN status = 'current' THEN 1 ELSE 0 END) AS active_sprints
  FROM sprint_data
  WHERE is_sprint = 1
  GROUP BY epic_id
)
SELECT
  s.id,
  s.name,
  s.agile,
  s.status,
  s.priority,
  s.parentID,
  s.epic_id,
  s.is_sprint,
  s.created_at,
  s.updated_at,
  COALESCE(es.total_sprints, 0) AS total_sprints,
  COALESCE(es.completed_sprints, 0) AS completed_sprints,
  COALESCE(es.active_sprints, 0) AS active_sprints,
  -- Formatted line for display
  CASE
    WHEN s.is_sprint = 1 THEN
      CONCAT('  ├── Sprint ', s.id, ': ', s.name, ' - ', UPPER(s.status), ' - ', UPPER(s.priority))
    ELSE
      CONCAT(
        'Plan ', s.id, ': ', s.name, ' - ', UPPER(s.status), ' - ', UPPER(s.priority),
        CASE
          WHEN es.total_sprints > 0 THEN
            CONCAT(' (', es.completed_sprints, '/', es.total_sprints, ' sprints complete)')
          ELSE ''
        END
      )
  END AS formatted_line,
  -- Sort fields
  CASE WHEN s.is_sprint = 1 THEN s.parentID ELSE s.id END AS sort_epic,
  s.is_sprint AS sort_level,
  s.id AS sort_id
FROM sprint_data s
LEFT JOIN epic_stats es ON (s.epic_id = es.epic_id AND s.is_sprint = 0)
ORDER BY sort_epic, sort_level, sort_id;
