-- api_wf.vw_eventProp source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `api_wf`.`vw_eventProp` AS
select
    a.id AS prop_id,
    a.xref_id AS xref_id,
    b.pageName,
    b.comp_type AS comp_type,
    b.comp_name AS comp_name,
    a.paramName AS paramName,
    a.paramVal AS paramVal,
    b.parent_id AS parent_id,
    b.pageID
from api_wf.eventProps a
join api_wf.vw_hier_components b 
on   a.xref_id = b.xref_id
order by
    b.pageID,
    a.xref_id,
    a.paramName;