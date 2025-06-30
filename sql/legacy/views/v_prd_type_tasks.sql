create or replace view v_prd_type_tasks
as
select
	ROW_NUMBER() OVER() uID, 	
   a.name			prd_type_nm
,	c.ordr			task_ordr
,	c.name			task_nm
,	c.description	task_desc
,  c.active
,  a.active			prd_type_active
,	c.active 		task_active
,	a.account_id
,  c.id		    	task_id
,	c.product_type_id prd_type_id
from  product_types a
join  tasks			c
on	  a.id = c.product_type_id
order by a.account_id, a.name, c.ordr