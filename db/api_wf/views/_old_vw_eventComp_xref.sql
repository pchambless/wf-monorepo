-- BROKEN VIEW
-- Warning 1356: View 'api_wf._old_vw_eventComp_xref' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them

-- Original DDL (commented out):
/*
CREATE
OR REPLACE VIEW _old_vw_eventComp_xref AS
SELECT
x.id AS xref_id,
x.pageID AS pageID,
x.parent_id AS parent_id,
b.pageName AS pageName,
api_wf.f_xrefParent(x.parent_id) AS parent_name,
x.comp_name AS comp_name,
concat(api_wf.f_xrefParent(x.parent_id),
'.',
x.comp_name) AS parentCompName,
x.title AS title,
x.comp_type AS comp_type,
x.posOrder AS posOrder,
x.style AS override_styles,
x.description AS description
FROM (eventComp_xref x
JOIN page_registry b on((x.pageID = b.id)))
WHERE (x.active = 1)
ORDER BY b.pageName,
api_wf.f_xrefParent(x.parent_id),
x.comp_name,
x.posOrder;
*/
