create or replace view wf__products as
select
  b.name as prodTypeName,
  a.name as prodName,
  a.code as prodCode,
  ifnull(
    replace
      (a.description, '\n', '<br>'),
      ''
  ) as description,
  a.best_by_days as bestByDays,
  ifnull(a.location, '') as location,
  whatsfresh.f_measure (a.measure_id) as prodMeas,
  a.account_id as account_id,
  a.id as product_id,
  a.product_type_id as product_type_id
from
  (
    (
      whatsfresh.products a
      join whatsfresh.product_types b on ((a.product_type_id = b.id))
    )
    join whatsfresh.accounts c on ((a.account_id = c.id))
  )
where
  (
    (a.active = 1)
    and (c.active = 1)
  )
