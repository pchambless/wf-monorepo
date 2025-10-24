  create OR replace view vw_plan45 as
  SELECT 
    plan_id, 
    'communication' COLLATE utf8mb4_general_ci AS source, 
    from_agent COLLATE utf8mb4_general_ci AS agent, 
    type COLLATE utf8mb4_general_ci AS change_type, 
    subject COLLATE utf8mb4_general_ci, 
    message COLLATE utf8mb4_general_ci, 
    created_at
  FROM api_wf.plan_communications
  WHERE plan_id = 45

  UNION 

  SELECT 
    plan_id, 
    'impacts' COLLATE utf8mb4_general_ci AS source, 
    created_by COLLATE utf8mb4_general_ci AS agent, 
    change_type COLLATE utf8mb4_general_ci, 
    '' COLLATE utf8mb4_general_ci AS subject, 
    description COLLATE utf8mb4_general_ci AS message, 
    created_at
  FROM plan_impacts
  WHERE plan_id = 45
ORDER BY created_at DESC;

