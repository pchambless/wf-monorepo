create or replace view api_wf.vw_hier_components as
 SELECT
    x.id as id,   
    x.name  comp_name,
    c.`name` template, 
    x.posOrder,
    case 
        when c.name = 'ServerQuery' then x.qrySQL 
        else x.props
    end props, 
    c.style base_styles,
    x.style override_styles,
    c.config  as tmplt_def,
    x.parent_id,
    x.eventType_id
FROM api_wf.eventType_xref x
JOIN api_wf.eventType_xref p ON x.parent_id = p.id
JOIN api_wf.eventType c ON x.eventType_id = c.id
WHERE x.active = 1 AND p.active = 1 AND c.active = 1;