create or replace view vw_module_map as
select
  p.package as parent_package,
  c.package as child_package,
  (
    case
      when (
        (p.active = 1)
        and (c.active = 1)
      ) then 'Valid'
      else 'Obsolete'
    end
  ) as status,
  p.fileName as parent_file,
  c.fileName as child_file,
  p.file_path as parent_path,
  c.file_path as child_path,
  (
    case
      when (p.package = c.package) then 'Internal'
      else 'External'
    end
  ) as crossed,
  a.module_id as child_id,
  a.parent_id as parent_id,
  p.active as active_parent,
  c.active as active_child,
  p.last_detected_at as parent_detected_at,
  c.last_detected_at as child_detected_at
from
  (
    (
      module_xref a
      left join modules p on ((a.parent_id = p.id))
    )
    left join modules c on ((a.module_id = c.id))
  )
order by
  p.package,
  p.file_path,
  c.file_path
