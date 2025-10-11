-- api_wf.vw_hier_components source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW api_wf.vw_hier_components AS
select
    x.xref_id,
    api_wf.f_xrefParent(x.parent_id) parent_name,
    x.comp_name AS comp_name,
	concat(api_wf.f_xrefParent(x.parent_id),'.',x.comp_name) parentCompName,
    x.title AS title,
	x.comp_type,
    x.container AS container,
    x.posOrder AS posOrder,
    x.style AS override_styles,
    x.description AS description
from
    api_wf.eventComp_xref x
where
    x.active = 1
    and parent_name <> comp_name
order by
    api_wf.f_xrefParent(x.parent_id), comp_name, 
    x.posOrder;