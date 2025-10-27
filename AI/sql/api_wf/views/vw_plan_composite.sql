create or replace view vw_plan_composite as
	SELECT 
	    id plan_id, 
	    'plan' COLLATE utf8mb4_general_ci AS source, 
	    created_by COLLATE utf8mb4_general_ci AS agent, 
	    'The Plan'  COLLATE utf8mb4_general_ci AS change_type, 
	    name COLLATE utf8mb4_general_ci AS subject, 
	    description COLLATE utf8mb4_general_ci AS message, 
	    created_at
	FROM api_wf.plans
UNION
	SELECT 
	    plan_id, 
	    'communication' COLLATE utf8mb4_general_ci AS source, 
	    from_agent COLLATE utf8mb4_general_ci AS agent, 
	    type COLLATE utf8mb4_general_ci AS change_type, 
	    subject COLLATE utf8mb4_general_ci AS subject, 
	    message COLLATE utf8mb4_general_ci AS message, 
	    created_at
	FROM api_wf.plan_communications
UNION 
  SELECT 
    plan_id, 
    'impacts' COLLATE utf8mb4_general_ci AS source, 
    created_by COLLATE utf8mb4_general_ci AS agent, 
    change_type COLLATE utf8mb4_general_ci, 
    file_path COLLATE utf8mb4_general_ci AS subject, 
    description COLLATE utf8mb4_general_ci AS message, 
    created_at
  FROM plan_impacts
ORDER BY plan_id desc, created_at;