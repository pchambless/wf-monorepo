create or replace view vw_module_impact_dtl as
SELECT
    m.fileName,
    m.fileFolder,
    m.file_path,
    m.active,
    t.description as impact,
    t.plan_id,
    t.id as impact_id,
    p.name as plan_name,
    p.status as plan_status,
    t.change_type,
    t.batch_id,
    t.affected_apps
  FROM api_wf.modules m
  JOIN api_wf.plan_impacts t 
  ON m.file_path = t.file_path
  LEFT JOIN api_wf.plans p 
  ON t.plan_id = p.id
  WHERE m.active = 1
  ORDER BY m.fileFolder;