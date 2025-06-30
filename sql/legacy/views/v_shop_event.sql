create or replace view v_shop_event as
select  ROW_NUMBER() OVER() uID, 
	f_shop_event(a.id) shop_name
, concat('$',format(ifnull(b.total_amount,0),2)) total_amount
, ifnull(b.items,0) items
, ifnull(a.comments,'') comments
, f_vendor(a.vendor_id) vendor
, date_format(a.shop_date,'%Y-%m-%d') shop_date
, a.account_id
, a.vendor_id
, a.id shop_event_id
from shop_event a
left join 
  (select shop_event_id, count(id) items, ifnull(sum(purchase_quantity * unit_price),0) total_amount 
   from ingredient_batches
	group by 1) b
on a.id = b.shop_event_id
order by a.shop_date desc
