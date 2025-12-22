-- Sprint Outline View for Epic → Sprint Hierarchy Visualization
-- Created: 2025-12-20
-- Purpose: Provides formatted tree view of plans and their sprints for dev/agent reference

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
    CASE
      WHEN p.agile = 'epic' THEN p.id
      ELSE p.parentID
    END as epic_id,
    CASE
      WHEN p.agile = 'epic' THEN 0
      ELSE 1
    END as is_sprint
  FROM api_wf.plans p
  WHERE p.active = 1
    AND p.deleted_at IS NULL
),
epic_stats AS (
  SELECT
    epic_id,
    COUNT(*) as total_sprints,
    SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as completed_sprints,
    SUM(CASE WHEN status = 'current' THEN 1 ELSE 0 END) as active_sprints
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
  -- Epic progress stats
  COALESCE(es.total_sprints, 0) as total_sprints,
  COALESCE(es.completed_sprints, 0) as completed_sprints,
  COALESCE(es.active_sprints, 0) as active_sprints,
  -- Formatted display lines
  CASE
    WHEN s.is_sprint = 1 THEN 
      CONCAT('  ├── Sprint ', s.id, ': ', s.name, ' - ', UPPER(s.status), ' - ', UPPER(s.priority))
    ELSE 
      CONCAT('Plan ', s.id, ': ', s.name, ' - ', UPPER(s.status), ' - ', UPPER(s.priority),
        CASE 
          WHEN es.total_sprints > 0 THEN CONCAT(' (', es.completed_sprints, '/', es.total_sprints, ' sprints complete)')
          ELSE ''
        END)
  END as formatted_line,
  -- Sort order for proper tree display
  CASE WHEN s.is_sprint = 1 THEN s.parentID ELSE s.id END as sort_epic,
  s.is_sprint as sort_level,
  s.id as sort_id
FROM sprint_data s
LEFT JOIN epic_stats es ON s.epic_id = es.epic_id AND s.is_sprint = 0
ORDER BY sort_epic, sort_level, sort_id;