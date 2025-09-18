create or replace view api_wf.vw_hier_components as
 SELECT
    x.id as id,   
    x.parent_id,
    LPAD(CAST(x.id AS CHAR), 5, '0') as id_path,
    c.`name` template, 
    c.cluster as template_cluster,
    x.name  comp_name,
    x.position,
     CONCAT(
      LPAD(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(x.position, '$.row.start')), '0'), 2, '0'), ',',
      LPAD(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(x.position, '$.row.span')), '1'), 2, '0'), ';',
      LPAD(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(x.position, '$.col.start')), '0'), 2, '0'), ',',
      LPAD(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(x.position, '$.col.span')), '1'), 2, '0')
  ) as posOrder
    case 
        when c.name = 'ServerQuery' then x.qrySQL 
        else x.props
    end props, 
    p.`name`,
    p.title as parent_title,
    c.title as template_title,
    c.definition  as tmplt_def,
    x.app_id,
    x.eventType_id
FROM api_wf.eventType_xref x
JOIN api_wf.eventType_xref p ON x.parent_id = p.id
JOIN api_wf.eventType c ON x.eventType_id = c.id
WHERE x.active = 1 AND p.active = 1 AND c.active = 1;