-- api_wf.vw_hier_components source

CREATE OR REPLACE VIEW api_wf.vw_hier_components AS
SELECT
    x.id AS xref_id,
    b.pageName AS pageName,
    api_wf.f_xrefParent(x.parent_id) AS parent_name,
    x.comp_name AS comp_name,
    CONCAT(api_wf.f_xrefParent(x.parent_id), '.', x.comp_name) AS parentCompName,
    x.title AS title,
    x.comp_type AS comp_type,
    x.posOrder AS posOrder,
    x.style AS override_styles,
    x.description AS description,
    x.parent_id,
    x.pageID 
FROM api_wf.eventComp_xref x
join api_wf.page_registry b
on   x.pageID = b.id
WHERE x.active = 1
ORDER BY
    b.pageName,
    api_wf.f_xrefParent(x.parent_id),
    x.comp_name,
    x.posOrder;
