create or replace view api_wf.wf_shopEvent as
select
 whatsfresh.f_shop_event(a.id) shopName
, concat('$',format(ifnull(b.total_amount,0),2)) totalAmt
, ifnull(b.items,0) items
, ifnull(a.comments,'') comments
, whatsfresh.f_vendor(a.vendor_id) vndrName
, date_format(a.shop_date,'%Y-%m-%d') shopDate
, a.account_id
, a.vendor_id
, a.id 				shop_event_id
from whatsfresh.shop_event a
left join 
  (select shop_event_id, count(id) items, ifnull(sum(purchase_quantity * unit_price),0) total_amount 
   from whatsfresh.ingredient_batches
	group by 1) b
on a.id = b.shop_event_id
order by a.shop_date desc