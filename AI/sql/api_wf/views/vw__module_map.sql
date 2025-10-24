create or replace view vw_module_map as 
SELECT
	p.package parent_package,
	c.package child_package,
    p.fileName parent_file,
    c.fileName child_file,
    p.file_path parent_path,
    c.file_path child_path,
    CASE WHEN p.package = c.package THEN 'Internal' ELSE 'External' END  crossed,
    case when p.active = 1 and c.active = 1 then 'Valid' else 'Obsolete' end status,
    a.module_id child_id,
    a.parent_id,
    p.active  active_parent,
    c.active  active_child,
    p.last_detected_at parent_detected_at,
    c.last_detected_at child_detected_at
  FROM module_xref a
  left JOIN modules p ON a.parent_id = p.id
  left JOIN modules c ON a.module_id = c.id
  ORDER BY  p.package, p.file_path, c.file_path