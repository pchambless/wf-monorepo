create or replace view vw_page_analysis as
select
  page_registry.id as pageID,
  page_registry.pageName as pageName,
  page_registry.appName as appName,
  page_registry.appID as appID,
  page_registry.status as status,
  json_unquote(json_extract(page_registry.props, '$.tableName')) as tableName,
  json_unquote(
    json_extract(page_registry.props, '$.template_type')
  ) as template_type,
  json_extract(page_registry.props, '$.parentID') as parentID,
  json_extract(page_registry.props, '$.tableID') as tableID,
  json_unquote(json_extract(page_registry.props, '$.contextKey')) as contextKey,
  json_unquote(json_extract(page_registry.props, '$.pageTitle')) as pageTitle,
  json_unquote(
    json_extract(page_registry.props, '$.formHeadCol')
  ) as formHeadCol
from
  page_registry
where
  (page_registry.active = 1)
