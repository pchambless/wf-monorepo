create or replace view v_products as
select b.name 												prodType
,a.name 														product
,a.code
,ifnull(replace(a.description,'\n','<br>'),'') 	description
,a.best_by_days
,ifnull(a.location,'') 									location
,f_measure(a.measure_id) 								meas
,a.active
,a.account_id 										
,a.id 														product_id
,a.product_type_id 
from products a 
join product_types b 
on   a.product_type_id = b.id
join accounts c 
on   a.account_id = c.id
where a.active = 1 and  c.active = 1
