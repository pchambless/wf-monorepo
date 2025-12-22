create or replace view vw_module_audit as
select
  m.id as module_id,
  m.package as package,
  m.fileFolder as fileFolder,
  m.fileName as fileName,
  m.file_path as file_path,
  m.active as is_active,
  m.deleted_at as deleted_at,
  m.last_detected_at as last_detected_at,
  (to_days(now()) - to_days(m.last_detected_at)) as days_since_detected,
  m.created_at as module_created,
  m.created_by as module_creator,
  (
    select
      count(0)
    from
      module_xref
    where
      (
        (module_xref.parent_id = m.id)
        and (module_xref.deleted_at is null)
      )
  ) as depends_on_count,
  (
    select
      count(0)
    from
      module_xref
    where
      (
        (module_xref.module_id = m.id)
        and (module_xref.deleted_at is null)
      )
  ) as depended_by_count,
  t.id as impact_id,
  t.plan_id as plan_id,
  t.change_type as change_type,
  t.phase as phase,
  t.description as impact_description,
  t.status as impact_status,
  t.created_at as impact_date,
  t.created_by as changed_by,
  t.affected_apps as affected_apps,
  p.name as plan_name,
  p.status as plan_status,
  p.priority as plan_priority,
  (
    case
      when (
        (m.active = 0)
        and (t.change_type = 'DELETE')
      ) then 'Intentionally deleted'
      when (
        (m.active = 0)
        and (t.change_type is null)
      ) then 'Missing (no impact logged)'
      when (m.active = 0) then 'Deleted (impact logged)'
      when (
        (m.active = 1)
        and (t.id is null)
      ) then 'Active (undocumented)'
      else 'Active (documented)'
    end
  ) as audit_status,
  (
    case
      when m.package in (
        select distinct
          modules.package
        from
          modules
        where
          (modules.active = 1)
      ) then 0
      else 1
    end
  ) as orphan_package
from
  (
    (
      modules m
      left join plan_impacts t on ((m.file_path = t.file_path))
    )
    left join plans p on ((t.plan_id = p.id))
  )
