-- api_wf.vw_eventTrigger source

CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `api_wf`.`vw_eventTrigger` AS
select
    a.id AS trigger_id,
    a.pageID,
    a.xref_id AS xref_id,
    b.pageName,
    b.comp_name AS comp_name,
    b.comp_type AS comp_type,
    a.ordr AS ordr,
    a.class AS class,
    a.action AS action,
    b.parent_id AS parent_id,
	e.api_id,
    e.wrkFlow_id,
    e.controller_id,
    d.is_dom_event AS is_dom_event,
    a.content AS content
from   api_wf.eventTrigger a
join   api_wf.vw_hier_components b 
on     a.xref_id = b.xref_id
join api_wf.triggers d 
on     a.class = d.name
join   api_wf.triggers e
on     a.action = e.name
order by
    a.pageID,
    b.parent_id,
    a.xref_id,
    a.ordr;