create or replace view vw_module_impact_dtl as
select
  t.plan_id as plan,
  t.change_type as change_type,
  m.package as package,
  m.fileFolder as fileFolder,
  m.fileName as fileName,
  m.file_path as file_path,
  m.active as active,
  m.last_detected_at as last_detected_at,
  t.description as impact,
  t.created_at as impact_date,
  t.created_by as impact_by,
  p.name as plan_name,
  p.status as plan_status,
  t.affected_apps as affected_apps,
  t.id as impact_id,
  (
    case
      when (t.id is null) then 'No impacts logged'
      else 'Has impacts'
    end
  ) as impact_status
from
  (
    (
      modules m
      left join plan_impacts t on (
        (
          trim(
            trailing '/'
            from
              m.file_path
          ) = trim(
            trailing '/'
            from
              t.file_path
          )
        )
      )
    )
    left join plans p on ((t.plan_id = p.id))
  )
order by
  t.plan_id desc,
  m.package,
  m.fileFolder,
  m.fileName
