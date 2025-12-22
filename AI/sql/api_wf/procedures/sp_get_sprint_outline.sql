-- Sprint Outline Stored Procedure
-- Created: 2025-12-20
-- Purpose: Get formatted sprint outline for specific epic or all epics
-- Usage: CALL api_wf.sp_get_sprint_outline(75); -- Specific epic
--        CALL api_wf.sp_get_sprint_outline(NULL); -- All epics

DELIMITER $$

DROP PROCEDURE IF EXISTS api_wf.sp_get_sprint_outline$$

CREATE PROCEDURE api_wf.sp_get_sprint_outline(
  IN epic_id_filter INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- Return formatted sprint outline
  SELECT
    id,
    name,
    agile,
    status,
    priority,
    parentID,
    epic_id,
    is_sprint,
    total_sprints,
    completed_sprints,
    active_sprints,
    formatted_line as outline,
    created_at,
    updated_at
  FROM api_wf.vw_sprint_outline
  WHERE (epic_id_filter IS NULL OR epic_id = epic_id_filter)
  ORDER BY sort_epic, sort_level, sort_id;

END$$

DELIMITER ;