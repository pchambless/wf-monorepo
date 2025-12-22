create or replace view vw_execEvents as
select
  json_unquote(json_extract(jt.value, '$.qryName')) as qryName,
  json_unquote(json_extract(jt.value, '$.qrySQL')) as qrySQL,
  'composite' as source,
  composites.id as source_id,
  composites.name as component_name
from
  (
    composites
    join json_table(
      composites.eventSQL,
      '$.*' columns (value json path '$')
    ) jt
  )
where
  (
    (composites.active = 1)
    and (composites.eventSQL is not null)
  )
union all
select
  json_unquote(json_extract(jt.value, '$.qryName')) as qryName,
  json_unquote(json_extract(jt.value, '$.qrySQL')) as qrySQL,
  'pageConfig' as source,
  pageConfig.id as id,
  concat(
    'page_',
    pageConfig.pageID,
    '_comp_',
    pageConfig.pageComponent_id
  ) as concat('page_', pageID, '_comp_', pageComponent_id)
from
  (
    pageConfig
    join json_table(
      pageConfig.eventSQL,
      '$.*' columns (value json path '$')
    ) jt
  )
where
  (
    (pageConfig.active = 1)
    and (pageConfig.eventSQL is not null)
  )
