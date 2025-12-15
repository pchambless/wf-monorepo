CREATE OR REPLACE VIEW api_wf.vw_page_analysis AS
SELECT 
  id pageID,
  pageName,
  appName,
  appID,
  status,
  JSON_UNQUOTE(JSON_EXTRACT(props, '$.tableName')) as tableName,
  JSON_UNQUOTE(JSON_EXTRACT(props, '$.template_type')) as template_type,
  JSON_EXTRACT(props, '$.parentID') as parentID,
  JSON_EXTRACT(props, '$.tableID') as tableID,
  JSON_UNQUOTE(JSON_EXTRACT(props, '$.contextKey')) as contextKey,
  JSON_UNQUOTE(JSON_EXTRACT(props, '$.pageTitle')) as pageTitle,
  JSON_UNQUOTE(JSON_EXTRACT(props, '$.formHeadCol')) as formHeadCol
FROM api_wf.page_registry
WHERE active = 1;