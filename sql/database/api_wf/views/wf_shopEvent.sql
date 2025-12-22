create or replace view wf_shopEvent as
select
  whatsfresh.f_shop_event (a.id) as shopName,
  concat('$', format(ifnull(b.total_amount, 0), 2)) as totalAmt,
  ifnull(b.items, 0) as items,
  ifnull(a.comments, '') as comments,
  whatsfresh.f_vendor (a.vendor_id) as vndrName,
  date_format(a.shop_date, '%Y-%m-%d') as shopDate,
  a.account_id as account_id,
  a.vendor_id as vendor_id,
  a.id as shop_event_id
from
  (
    whatsfresh.shop_event a
    left join (
      select
        whatsfresh.ingredient_batches.shop_event_id as shop_event_id,
        count(whatsfresh.ingredient_batches.id) as items,
        ifnull(
          sum(
            (
              whatsfresh.ingredient_batches.purchase_quantity * whatsfresh.ingredient_batches.unit_price
            )
          ),
          0
        ) as total_amount
      from
        whatsfresh.ingredient_batches
      group by
        whatsfresh.ingredient_batches.shop_event_id
    ) b on ((a.id = b.shop_event_id))
  )
order by
  a.shop_date desc
