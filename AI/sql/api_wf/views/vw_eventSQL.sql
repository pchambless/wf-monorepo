create or replace view vw_eventSQL as
select
    a.xref_id,
    a.pageName, 
    a.comp_name, 
    a.comp_type,
    c.qryName, 
    c.qrySQL,
    a.pageID
from
    api_wf.vw_hier_components a
left join 
    (select
        xref_id,
        content qryName
    from
        api_wf.eventTrigger
    where action = 'execEvent'
    ) b
    on a.xref_id = b.xref_id 
left join api_wf.eventSQL c 
on  b.qryName = c.qryName
where c.id is not null;


