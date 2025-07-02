create or replace view v_prd_type_tasks_active
as
select *	
from v_prd_type_tasks a
where  a.prd_type_active = 'Y'
and    a.task_active = 'Y'