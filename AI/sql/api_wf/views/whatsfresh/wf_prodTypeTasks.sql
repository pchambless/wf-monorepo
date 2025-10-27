create or replace view api_wf.wf_prodTypeTasks
as
select
   a.name			prdTypeName
,	c.ordr			taskOrdr
,	c.name			taskName
,	c.description	taskDesc
,  a.active			prodTypeActive
,	c.active 		taskActive
,	a.account_id
,  c.id		    	task_id
,	c.product_type_id prd_type_id
from  whatsfresh.product_types a
join  whatsfresh.tasks			c
on	  a.id = c.product_type_id
order by a.account_id, a.name, c.ordr
