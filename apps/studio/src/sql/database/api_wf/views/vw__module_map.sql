create or replace view vw_module_map as 
SELECT
	p.package parent_package,
	c.package child_package,
    p.fileFolder parent_folder,
    p.fileName parent_file,
    c.fileFolder child_folder,
    c.fileName child_file,
    CASE WHEN p.package = c.package THEN 'Internal' ELSE 'External' END as crossed,
    a.module_id child_id,
    a.parent_id,
    p.active  active_parent,
    c.active  active_child
  FROM module_xref a
  left JOIN modules p ON a.parent_id = p.id
  left JOIN modules c ON a.module_id = c.id
  ORDER BY  p.package, p.fileFolder, c.fileFolder, p.fileName, c.package,  c.fileName