DELIMITER //

DROP PROCEDURE IF EXISTS sp_logPlanImpact//

CREATE PROCEDURE sp_logPlanImpact(
  IN p_plan_id INT,
  IN p_target VARCHAR(500),        -- 'api_wf.eventSQL' or 'apps/studio/src/App.jsx'
  IN p_change_type VARCHAR(20),    -- 'feature', 'fix', 'refactor', 'delete'
  IN p_description TEXT,           -- Agent's description
  IN p_phase VARCHAR(20),          -- 'sprint-s1'
  IN p_agent VARCHAR(50),          -- 'kiro', 'claude', 'github-copilot', etc.
  IN p_affected_apps JSON,         -- '["studio"]' or NULL
  IN p_details JSON                -- Optional extra metadata
)
BEGIN
  DECLARE v_is_db_table BOOLEAN DEFAULT FALSE;
  DECLARE v_package VARCHAR(50);
  DECLARE v_blast_radius ENUM('low','medium','high');
  DECLARE v_impact_id INT;
  
  -- Detect if it's a database table or file
  SET v_is_db_table = (p_target LIKE 'api_wf.%' OR p_target LIKE '%.%');
  
  -- If it's a file, try to get blast radius from modules table
  IF NOT v_is_db_table THEN
    SELECT blast_radius, package 
    INTO v_blast_radius, v_package
    FROM modules 
    WHERE file_path = p_target
    LIMIT 1;
    
    -- Auto-populate affected_apps if not provided
    IF p_affected_apps IS NULL AND v_package IS NOT NULL THEN
      SET p_affected_apps = JSON_ARRAY(v_package);
    END IF;
  END IF;
  
  -- Insert the impact
  INSERT INTO plan_impacts 
    (plan_id, file_path, phase, change_type, status, description, 
     affected_apps, auto_generated, cross_app_analysis, created_by)
  VALUES 
    (p_plan_id, p_target, p_phase, p_change_type, 'in-progress',
     p_description, p_affected_apps, 0, p_details, p_agent);
  
  SET v_impact_id = LAST_INSERT_ID();
  
  -- If blast_radius is high, auto-create dependency impacts
  IF v_blast_radius = 'high' THEN
    INSERT INTO plan_impacts 
      (plan_id, file_path, phase, change_type, status, description, 
       affected_apps, auto_generated, cross_app_analysis, created_by)
    SELECT 
      p_plan_id,
      dep.file_path,
      p_phase,
      'dependency',
      'pending',
      CONCAT('Affected by changes to ', SUBSTRING_INDEX(p_target, '/', -1)),
      JSON_ARRAY(dep.package),
      1,
      JSON_OBJECT(
        'source_file', p_target,
        'source_impact_id', v_impact_id,
        'blast_radius', v_blast_radius
      ),
      'auto-impact-detector'
    FROM modules m
    JOIN module_xref x ON m.id = x.module_id
    JOIN modules dep ON x.parent_id = dep.id
    WHERE m.file_path = p_target
      AND x.active = 1
    LIMIT 50;  -- Safety limit
  END IF;
  
  -- Return confirmation with summary
  SELECT 
    CONCAT('✅ Impact logged for: ', p_target) as result,
    p_plan_id as plan_id,
    p_phase as phase,
    p_change_type as change_type,
    IFNULL(v_blast_radius, 'N/A') as blast_radius,
    (SELECT COUNT(*) FROM plan_impacts 
     WHERE plan_id = p_plan_id 
       AND auto_generated = 1 
       AND JSON_EXTRACT(cross_app_analysis, '$.source_impact_id') = v_impact_id
    ) as auto_impacts_created;
END//

DELIMITER ;
