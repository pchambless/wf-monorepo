CREATE OR REPLACE VIEW api_wf.vw_pageComponents AS
SELECT 
    x.id AS xref_id,
    x.pageID,
    x.comp_name,
    x.comp_type,
    x.parent_id,
    x.title,
    x.description,
    x.posOrder,
    x.style AS override_styles,
    COALESCE(p.props, '{}') AS props,
    COALESCE(p.triggers, '[]') AS triggers
FROM api_wf.eventComp_xref x
LEFT JOIN api_wf.eventPageConfig p ON x.id = p.xref_id AND x.pageID = p.pageID
WHERE x.active = 1;