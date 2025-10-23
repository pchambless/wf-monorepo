CREATE OR REPLACE VIEW api_wf.vw_eventProp AS
select
    a.id AS prop_id,
    a.xref_id AS xref_id,
    api_wf.b.parent_id AS parent_id,
    api_wf.b.comp_type AS comp_type,
    api_wf.b.comp_name AS comp_name,
    a.paramName AS paramName,
    a.paramVal AS paramVal
from api_wf.eventProps a
join api_wf.vw_hier_components b 
on   a.xref_id = api_wf.b.xref_id
order by
    a.xref_id,
    a.paramName;